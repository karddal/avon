
import datetime
from typing import Literal
from uuid import UUID
import uuid

from sqlalchemy import String
from sqlmodel import Field, SQLModel, UniqueConstraint


class ProvisionBatch(SQLModel, table=True):
   
    id: UUID = Field(primary_key=True, default_factory=uuid.uuid4) 
    cw_id: UUID
    total_jobs: int
    completed: int
    failed: int
    status: Literal["pending", "running", "done"] = Field(default="pending", sa_type=String)

class ProvisionProject(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint("student_id", "cw_id"),
    )
    id: UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    # str because thats how the uuid is stored
    batch_id: UUID = Field(nullable=False)
    student_id: str = Field(nullable=False) 
    cw_id: UUID = Field(nullable=False)
    # better to denormalise
    cw_name: str = Field(nullable=False)
    # You need a template
    template_id: int = Field(nullable=False)
    gitlab_id: int = Field(nullable=False)

    status: Literal["pending", "in_progress", "success", "failed"] = Field(default="pending", sa_type=String)
    # status: str
    attempts: int = 0
    max_attempts: int = 4

    last_error: str | None = None
    next_run_at: datetime.datetime = Field(default_factory=datetime.datetime.now)

    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now) 
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.now)




    
