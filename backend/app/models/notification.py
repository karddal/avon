import uuid
from uuid import UUID

from sqlmodel import Field, SQLModel
from datetime import datetime, timezone


class Notification(SQLModel, table=True):
    """
    A notification sent by a user to a user.
    """
    id: UUID = Field(primary_key=True, default_factory=uuid.uuid4())
    recipient_id: str = Field(nullable=False)
    author_id: str = Field(nullable=False)
    title: str = Field(nullable=False)
    body: str = Field(nullable=False)
    created_at: datetime = Field(nullable=False, default_factory=datetime.now(timezone.utc))
    viewed: bool = Field(nullable=False, default=False)

