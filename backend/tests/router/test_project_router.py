# test_provision.py
import pytest
from unittest.mock import AsyncMock, patch
from sqlmodel import Session, create_engine, SQLModel
import datetime
import uuid

from app.models.projects import ProvisionProject
from app.routers.project import process_job
from app.core.helpers.gitlab import gl_create_fork

from app.routers import project as project_module

# Use a separate in-memory test DB
TEST_DATABASE_URL = "sqlite://"
engine = create_engine(TEST_DATABASE_URL)

@pytest.fixture(autouse=True)
def setup_db(monkeypatch):
    SQLModel.metadata.create_all(engine)
    monkeypatch.setattr(project_module, "engine", engine)
    yield
    SQLModel.metadata.drop_all(engine)

@pytest.fixture
def make_job():
    def _make_job(**overrides):
        job = ProvisionProject(
            student_id="test_student",
            cw_id=uuid.uuid4(),
            cw_name="test-cw",
            gitlab_id=123,
            template_id=456,
            **overrides
        )
        with Session(engine) as session:
            session.add(job)
            session.commit()
            session.refresh(job)
            return job.id
    return _make_job

def get_job(job_id):
    with Session(engine) as session:
        return session.get(ProvisionProject, job_id)


@pytest.mark.asyncio
async def test_job_succeeds(make_job):
    job_id = make_job()
    with patch("app.routers.project.gl_create_fork", new_callable=AsyncMock):
        await process_job(job_id)
    assert get_job(job_id).status == "success"

@pytest.mark.asyncio
async def test_job_retries_on_failure(make_job):
    job_id = make_job()
    with patch("app.routers.project.gl_create_fork", new_callable=AsyncMock) as mock_fork:
        mock_fork.side_effect = Exception("GitLab unavailable")
        await process_job(job_id)
    job = get_job(job_id)
    assert job.status == "pending"
    assert job.attempts == 1
    assert job.next_run_at > datetime.datetime.now()
    assert job.last_error == "GitLab unavailable"

@pytest.mark.asyncio
async def test_job_fails_after_max_attempts(make_job):
    job_id = make_job(attempts=4)
    with patch("app.routers.project.gl_create_fork", new_callable=AsyncMock) as mock_fork:
        mock_fork.side_effect = Exception("GitLab unavailable")
        await process_job(job_id)
    assert get_job(job_id).status == "failed"