import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from starlette import status

from app.core.security import get_current_user
from app.db.session import get_session
from app.models.notification import Notification
from app.models.unit import Unit
from app.schemas.notification import NotificationAllInfo, CreateNotification, UnitInfo

router = APIRouter(prefix="/notification", tags=["notification"])
session_dependency = Annotated[Session, Depends(get_session)]

@router.get("/{id}", response_model=NotificationAllInfo)
async def get_notification(id: str, session: session_dependency):
    notif = session.get(Notification, id)
    return NotificationAllInfo(

    id=notif.id, unit=UnitInfo(

        unit_id=notif.unit.id, unit_name=notif.unit.name, unit_code=notif.unit.unit_code), title=notif.title, body=notif.body, created_at=notif.created_at, viewed=notif.viewed, recipient_id=notif.recipient_id)

@router.get("/{id}/mark_read", status_code=status.HTTP_200_OK)
async def mark_as_read(id: str, session: session_dependency, me: str = Depends(get_current_user)):
    notification = session.get(Notification, uuid.UUID(id))
    notification.viewed = True
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return status.HTTP_200_OK

@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_notification(notification: CreateNotification, session: session_dependency, me: str = Depends(get_current_user)):
    print("HELLO ----")
    print(notification)
    unit = session.get(Unit, uuid.UUID(notification.unit_id))
    for user in unit.enrollments:
        if user.type == "student":
            to_add = Notification(
                recipient_id=user.user_id,
                unit=unit,
                title=notification.title,
                body=notification.body,
            )
            session.add(to_add)

    session.commit()
    return status.HTTP_201_CREATED
