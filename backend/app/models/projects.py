
import datetime
from typing import Literal
from uuid import UUID
import uuid

from sqlalchemy import String
from sqlmodel import Field, SQLModel

from app.models import coursework


class ProvisionProjects(SQLModel, table=True):
    id: UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    student_id: UUID = Field(nullable=False) # This should be a foreign key, but idk how to access
    cw_id: UUID = Field(foreign_key=coursework.id)
    template_id: int = Field(nullable=True)

    status: Literal["pending", "in_progress", "success", "failed"] = Field(default="pending", sa_type=String)
    attempts: int = 0
    max_attempts: int = 4

    last_error: str | None = None
    next_run_at: datetime = Field(default_factory=datetime.utcnow)

    created_at: datetime = Field(default_factory=datetime.utcnow) 
    updated_at: datetime = Field(default_factory=datetime.utcnow)




    
