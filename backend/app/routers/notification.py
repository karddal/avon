from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from starlette import status

from app.core.security import get_current_user
from app.db.session import get_session
from app.models.notification import Notification
from app.schemas.notification import NotificationAllInfo, CreateNotification

router = APIRouter(prefix="/notification", tags=["notification"])
session_dependency = Annotated[Session, Depends(get_session)]

@router.get("/{id}", response_model=NotificationAllInfo)
async def get_notification(id: int, session: session_dependency):
    notif = session.get(Notification, id)
    return notif

@router.post("/create", response_model=NotificationAllInfo, status_code=status.HTTP_201_CREATED)
async def create_notification(notification: CreateNotification, session: session_dependency, me: str = Depends(get_current_user)):
    if not notification.author_id:
        author = me
    else:
        author = notification.author_id

    to_add = Notification(
        recipient_id=notification.recipient_id,
        author_id=author,
        title=notification.title,
        body=notification.body,
    )
    session.add(to_add)

    session.refresh(to_add)

    return to_add
