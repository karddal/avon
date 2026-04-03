import uuid
from datetime import datetime, timezone
from typing import Literal
from uuid import UUID

from sqlalchemy import String
from sqlmodel import Field, SQLModel
from sqlmodel.main import Relationship

from app.models.coursework import Coursework

status_type = Literal["pending", "running", "succeeded", "failed", "error"]
trigger_type = Literal["initial", "retry", "manual_rerun"]


def utcnow():
    return datetime.now(timezone.utc)


class TestRun(SQLModel, table=True):
    id: UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    coursework_id: UUID = Field(foreign_key="coursework.id")
    coursework: "Coursework" = Relationship(back_populates="test_runs")
    ecs_task_arn: str = Field(nullable=False)
    gitlab_repo_id: str = Field(nullable=False)
    git_url: str = Field(nullable=False)
    task_def: str = Field(nullable=False)
    tester_command: str = Field(nullable=False)
    status: status_type = Field(nullable=False, sa_type=String)
    completed_at: datetime | None = Field(nullable=True)
    trigger: trigger_type = Field(nullable=False, default="initial", sa_type=String)
    created_at: datetime = Field(nullable=False, default_factory=utcnow)
    notifications_enabled: bool = Field(nullable=False, default=False)
    started_by: str = Field(nullable=False)
    batch_id: UUID = Field(nullable=False)

class TestRunResult(SQLModel, table=True):
    test_run_id: UUID = Field(primary_key=True, foreign_key="testrun.id")
    exit_code: int = Field(nullable=False)
    log_s3_uri: str = Field(nullable=False)
    received_at: datetime = Field(nullable=False, default_factory=utcnow)
