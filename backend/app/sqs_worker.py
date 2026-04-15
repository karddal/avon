import asyncio
import json
import logging
from datetime import datetime, timezone
from uuid import UUID

import aioboto3
from sqlmodel import Session, select

from app.models.test_run import TestRunResult, TestRun
from app.notifications.notification import write_notification

logger = logging.getLogger(name="SQS Worker")


async def process_message(msg, db: Session):
    body = json.loads(msg["Body"])
    build_id = body["build_id"]
    exit_code = body["exit_code"]
    s3_key = body["s3_key"]

    run = db.get(TestRun, UUID(build_id))
    if not run:
        logger.error(f"No such run: {build_id}")
        return

    if exit_code != 0:
        run.status = "failed"
    else:
        run.status = "succeeded"

    run.completed_at = datetime.now(timezone.utc)

    if not db.get(TestRunResult, UUID(build_id)):
        # There is not already a result in the database, so we add it.

        db_result = TestRunResult(
            test_run_id=UUID(build_id),
            exit_code=int(exit_code),
            log_s3_uri=s3_key,
            received_at=datetime.now(timezone.utc),
        )
        db.add(db_result)

    db.add(run)

    logger.info(f"Processed {build_id} -> {exit_code}")

    db.commit()

    # Check whether there are any other running items in the batch
    # If so, send a notification if notifications are enabled.

    if (
        len(
            db.exec(
                select(TestRun).where(
                    (TestRun.batch_id == run.batch_id)
                    & ((TestRun.status == "running") | (TestRun.status == "pending"))
                )
            ).all()
        )
        == 0
    ):
        # There are no pending or running, so batch is complete.

        succeeded = len(
            db.exec(
                select(TestRun).where(
                    (TestRun.batch_id == run.batch_id) & (TestRun.status == "succeeded")
                )
            ).all()
        )

        failed = len(
            db.exec(
                select(TestRun).where(
                    (TestRun.batch_id == run.batch_id)
                    & ((TestRun.status == "failed") | (TestRun.status == "error"))
                )
            ).all()
        )

        test_run_completed_message = f"""Hey! The test batch you started at {run.created_at.isoformat(timespec="minutes")} for the coursework '{run.coursework.name}' has finished running, and you asked to be notified.
Here's a quick summary:
- Succeeded runs: {succeeded}
- Failed runs: {failed}

Have a great day!
The Avon Team
"""

        if run.notifications_enabled:
            write_notification(
                session=db,
                recipient=run.started_by,
                unit_id=run.coursework.unit_id,
                title="Test run completed",
                body=test_run_completed_message,
            )


async def sqs_worker(s, queue_url: str):
    logger.info("Starting up background worker")
    logger.info(f"Working on queue {queue_url}")
    session = aioboto3.Session()

    async with session.client("sqs") as sqs:
        logger.info("Logged into aws, starting up loop")
        while True:
            try:
                resp = await sqs.receive_message(
                    QueueUrl=queue_url, MaxNumberOfMessages=10, WaitTimeSeconds=20
                )
                messages = resp.get("Messages", [])

                for msg in messages:
                    try:
                        await process_message(msg, s)

                        await sqs.delete_message(
                            QueueUrl=queue_url, ReceiptHandle=msg["ReceiptHandle"]
                        )
                    except Exception as e:
                        print(f"Background worker error: {e}")

            except Exception as e:
                logger.error(f"Could not receive sqs messages: {e}")

            await asyncio.sleep(1)
