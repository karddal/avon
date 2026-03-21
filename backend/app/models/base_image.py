import uuid
from uuid import UUID

from sqlmodel import Field, Relationship, SQLModel

from app.models.coursework import Coursework


class BaseImage(SQLModel, table=True):
    id: UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    name: str = Field(nullable=False)
    description: str = Field(nullable=False)
    task_description_name: str = Field(nullable=False)
    courseworks: list["Coursework"] = Relationship(
        back_populates="base_image", cascade_delete=True
    )
    is_active: bool = Field(default=True, nullable=False)
