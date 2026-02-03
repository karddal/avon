from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

class UnitInfo(BaseModel):
    unit_id: UUID
    unit_name: str
    unit_code: str

class Notification(BaseModel):
    id: UUID
    unit: UnitInfo | None
    title: str
    body: str
    created_at: datetime
    viewed: bool

class NotificationAllInfo(Notification):
    recipient_id: str

class Notifications(BaseModel):
    notifications: list[Notification]

class CreateNotification(BaseModel):
    unit_id: str | None
    title: str
    body: str

class NotificationsUnreadExist(BaseModel):
    have_unread_notifications: bool