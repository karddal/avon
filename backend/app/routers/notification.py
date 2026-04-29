import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from starlette import status

from app.core.scopes.scopes import ResourceInformation, Scopes, require_scopes
from app.core.security import get_current_user
from app.core.security import get_bearer
from app.db.session import get_session
from app.models.notification import Notification
from app.models.unit import Unit
from app.schemas.notification import NotificationAllInfo, CreateNotification, UnitInfo

router = APIRouter(prefix="/notification", tags=["notification"])
session_dependency = Annotated[Session, Depends(get_session)]
token_dependency = Annotated[HTTPAuthorizationCredentials, Depends(get_bearer)]

@router.get("/{id}", response_model=NotificationAllInfo)
async def get_notification(
    id: str,
    session: session_dependency,
    me: str = Depends(get_current_user),
):
    notif = session.get(Notification, uuid.UUID(id))
    if notif is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    if notif.recipient_id != me:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return NotificationAllInfo(

    id=notif.id, unit=UnitInfo(

        unit_id=notif.unit.id, unit_name=notif.unit.name, unit_code=notif.unit.unit_code), title=notif.title, body=notif.body, created_at=notif.created_at, viewed=notif.viewed, recipient_id=notif.recipient_id)

@router.get("/{id}/mark_read", status_code=status.HTTP_200_OK)
async def mark_as_read(id: str, session: session_dependency, me: str = Depends(get_current_user)):
    notification = session.get(Notification, uuid.UUID(id))
    if notification is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    if notification.recipient_id != me:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    notification.viewed = True
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return status.HTTP_200_OK

@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification: CreateNotification,
    session: session_dependency,
    token: token_dependency,
    me: str = Depends(get_current_user),
):
    unit = session.get(Unit, uuid.UUID(notification.unit_id))
    if unit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")
    await require_scopes(
        ResourceInformation(Unit, unit.id),
        Scopes.UNIT_SEND_NOTIFICATION,
        token=token,
        session=session,
    )
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
