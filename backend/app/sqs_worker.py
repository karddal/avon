import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Any, Generator
from uuid import UUID

import aioboto3
from sqlmodel import Session
from types_aiobotocore_sqs.type_defs import MessageTypeDef

from app.models.test_run import TestRunResult, TestRun

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

    if (exit_code != 0):
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
            received_at=datetime.now(timezone.utc)
        )
        db.add(db_result)

    db.add(run)

    logger.info(f"Processed {build_id} -> {exit_code}")

    db.commit()


async def sqs_worker(s, queue_url: str):
    logger.info(f"Starting up background worker")
    logger.info(f"Working on queue {queue_url}")
    session = aioboto3.Session()

    async with session.client("sqs") as sqs:
        logger.info(f"Logged into aws, starting up loop")
        while True:
            try:
                resp = await sqs.receive_message(
                    QueueUrl=queue_url,
                    MaxNumberOfMessages=10,
                    WaitTimeSeconds=20
                )
            except Exception as e:
                logger.error(f"Could not receive sqs messages: {e}")

            messages = resp.get("Messages", [])

            for msg in messages:
                try:
                    await process_message(msg, s)

                    await sqs.delete_message(
                        QueueUrl=queue_url,
                        ReceiptHandle=msg["ReceiptHandle"]
                    )
                except Exception as e:
                    print(f"Background worker error: {e}")

            await asyncio.sleep(1)