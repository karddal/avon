import json
from datetime import datetime, timezone
from unittest.mock import Mock
from uuid import uuid4

import pytest
from sqlmodel import select

from app import sqs_worker
from app.models.test_run import TestRun, TestRunResult
from tests.helpers.factories import create_coursework, create_unit


def create_test_run(session, *, status="running", exit_code=None, notifications=False):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    batch_id = uuid4()
    test_run = TestRun(
        coursework_id=coursework.id,
        ecs_task_arn="arn",
        gitlab_repo_id="repo",
        git_url="https://gitlab/repo.git",
        task_def="task",
        tester_command="pytest",
        status=status,
        trigger="initial",
        started_by="lecturer@example.com",
        batch_id=batch_id,
        created_at=datetime.now(timezone.utc),
        notifications_enabled=notifications,
    )
    session.add(test_run)
    session.commit()
    if exit_code is not None:
        session.add(
            TestRunResult(
                test_run_id=test_run.id,
                exit_code=exit_code,
                log_s3_uri="s3://existing",
                received_at=datetime.now(timezone.utc),
            )
        )
        session.commit()
    return test_run


@pytest.mark.asyncio
async def test_process_message_ignores_missing_run(session):
    await sqs_worker.process_message(
        {
            "Body": json.dumps(
                {"build_id": str(uuid4()), "exit_code": 0, "s3_key": "s3://logs"}
            )
        },
        session,
    )

    assert session.exec(select(TestRunResult)).all() == []


@pytest.mark.asyncio
async def test_process_message_marks_run_succeeded_and_writes_result(session):
    test_run = create_test_run(session)

    await sqs_worker.process_message(
        {
            "Body": json.dumps(
                {
                    "build_id": str(test_run.id),
                    "exit_code": 0,
                    "s3_key": "s3://logs",
                }
            )
        },
        session,
    )

    session.refresh(test_run)
    result = session.get(TestRunResult, test_run.id)
    assert test_run.status == "succeeded"
    assert test_run.completed_at is not None
    assert result.exit_code == 0
    assert result.log_s3_uri == "s3://logs"


@pytest.mark.asyncio
async def test_process_message_marks_run_failed_and_does_not_duplicate_result(session):
    test_run = create_test_run(session, exit_code=1)

    await sqs_worker.process_message(
        {
            "Body": json.dumps(
                {
                    "build_id": str(test_run.id),
                    "exit_code": 2,
                    "s3_key": "s3://new-logs",
                }
            )
        },
        session,
    )

    session.refresh(test_run)
    results = session.exec(select(TestRunResult)).all()
    assert test_run.status == "failed"
    assert len(results) == 1
    assert results[0].log_s3_uri == "s3://existing"


@pytest.mark.asyncio
async def test_process_message_sends_notification_when_batch_finishes(
    session, monkeypatch
):
    test_run = create_test_run(session, notifications=True)
    notification = Mock()
    monkeypatch.setattr(sqs_worker, "write_notification", notification)

    await sqs_worker.process_message(
        {
            "Body": json.dumps(
                {
                    "build_id": str(test_run.id),
                    "exit_code": 0,
                    "s3_key": "s3://logs",
                }
            )
        },
        session,
    )

    notification.assert_called_once()
    assert notification.call_args.kwargs["recipient"] == "lecturer@example.com"
    assert notification.call_args.kwargs["title"] == "Test run completed"
