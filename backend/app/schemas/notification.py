from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

class Notification(BaseModel):
    id: UUID
    author_id: str
    title: str
    body: str
    created_at: datetime
    viewed: bool

class NotificationAllInfo(Notification):
    recipient_id: str

class Notifications(BaseModel):
    notifications: list[Notification]

class CreateNotification(BaseModel):
    author_id: str | None
    recipient_id: str
    title: str
    body: str
    created_at: datetime
    viewed: bool
