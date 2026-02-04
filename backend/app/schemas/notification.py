from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


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

class ReadNotification(BaseModel):
    id: UUID
    title: str
    body: str
    created_at: datetime
    viewed: bool

class UnitWithNotifs(UnitInfo):
    notifications: list[ReadNotification]

class Notifications(BaseModel):
    system_notifications: list[ReadNotification]
    notifications: list[UnitWithNotifs]

class CreateNotification(BaseModel):
    unit_id: str | None
    title: str = Field(min_length=1, max_length=60)
    body: str = Field(min_length=1, max_length=1000)

class NotificationsUnreadExist(BaseModel):
    have_unread_notifications: bool