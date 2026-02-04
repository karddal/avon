import uuid
from uuid import UUID

from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

from app.models.unit import Unit


class Notification(SQLModel, table=True):
    """
    A notification sent by a user to a user.
    """
    id: UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    recipient_id: str = Field(nullable=False)
    unit_id: UUID | None = Field(nullable=True, foreign_key="unit.id")
    title: str = Field(nullable=False)
    body: str = Field(nullable=False)
    created_at: datetime = Field(nullable=False, default_factory=datetime.now)
    viewed: bool = Field(nullable=False, default=False)
    unit: "Unit" = Relationship(back_populates="notifications")

