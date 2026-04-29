from datetime import datetime, timedelta
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from sqlmodel import select

from app.models.projects import ProvisionBatch, ProvisionProject
from app.models.student_repo import StudentRepo
from app import provision_worker


def create_batch_and_job(session, *, attempts=0, max_attempts=4, status="pending"):
    coursework_id = uuid4()
    batch = ProvisionBatch(
        cw_id=coursework_id,
        total_jobs=1,
        completed=0,
        failed=0,
        status="running",
    )
    session.add(batch)
    session.commit()
    job = ProvisionProject(
        batch_id=batch.id,
        student_id="student@example.com",
        cw_id=coursework_id,
        cw_name="Coursework",
        template_id=123,
        gitlab_id=456,
        attempts=attempts,
        max_attempts=max_attempts,
        status=status,
        next_run_at=datetime.now() - timedelta(seconds=1),
    )
    session.add(job)
    session.commit()
    return batch, job


def test_fetch_next_job_marks_pending_job_in_progress(engine, session, monkeypatch):
    monkeypatch.setattr(provision_worker, "engine", engine)
    batch, job = create_batch_and_job(session)

    assert provision_worker.fetch_next_job() == (job.id, batch.id)

    session.refresh(job)
    assert job.status == "in_progress"


def test_fetch_next_job_returns_none_when_no_pending_jobs(engine, monkeypatch):
    monkeypatch.setattr(provision_worker, "engine", engine)

    assert provision_worker.fetch_next_job() is None


@pytest.mark.asyncio
async def test_process_job_creates_student_repo(engine, session, monkeypatch):
    monkeypatch.setattr(provision_worker, "engine", engine)
    monkeypatch.setattr(
        provision_worker,
        "gl_create_fork",
        AsyncMock(return_value={"http_url_to_repo": "https://gitlab/repo", "id": 999}),
    )
    batch, job = create_batch_and_job(session)

    await provision_worker.process_job(job.id, batch.id)

    session.refresh(batch)
    session.refresh(job)
    assert job.status == "success"
    assert batch.completed == 1
    repo = session.exec(
        select(StudentRepo).where(StudentRepo.student_id == job.student_id)
    ).first()
    assert repo is not None
    assert repo.repo_url == "https://gitlab/repo"
    assert repo.gl_repo_id == "999"


@pytest.mark.asyncio
async def test_process_job_requeues_retryable_failures(engine, session, monkeypatch):
    monkeypatch.setattr(provision_worker, "engine", engine)
    monkeypatch.setattr(
        provision_worker,
        "gl_create_fork",
        AsyncMock(side_effect=RuntimeError("gitlab unavailable")),
    )
    batch, job = create_batch_and_job(session, attempts=0, max_attempts=2)

    await provision_worker.process_job(job.id, batch.id)

    session.refresh(batch)
    session.refresh(job)
    assert job.status == "pending"
    assert job.attempts == 1
    assert job.last_error == "gitlab unavailable"
    assert batch.failed == 0


@pytest.mark.asyncio
async def test_process_job_marks_exhausted_failures(engine, session, monkeypatch):
    monkeypatch.setattr(provision_worker, "engine", engine)
    monkeypatch.setattr(
        provision_worker,
        "gl_create_fork",
        AsyncMock(side_effect=RuntimeError("still broken")),
    )
    batch, job = create_batch_and_job(session, attempts=2, max_attempts=2)

    await provision_worker.process_job(job.id, batch.id)

    session.refresh(batch)
    session.refresh(job)
    assert job.status == "failed"
    assert batch.failed == 1
    assert job.last_error == "still broken"
