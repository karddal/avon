import datetime
from collections import defaultdict
from pathlib import Path
from uuid import uuid4

import aioboto3
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import exists
from sqlalchemy.orm import with_loader_criteria
from sqlalchemy.orm.strategy_options import selectinload
from sqlmodel import Session, select
from starlette import status

from app.core.env import is_development_app_env
from app.core.security import get_current_user, get_current_user_with_role
from app.core.settings import settings
from app.db.session import get_session
from app.models.notification import Notification
from app.models.programme import Programme
from app.models.unit import Unit, UnitWithCourseworks
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.coursework import CourseworkRead
from app.schemas.notification import Notifications, ReadNotification, UnitWithNotifs, \
    NotificationsUnreadExist
from app.schemas.profile_image import ProfileImageUploadResponse
from app.schemas.security import CurrentUser
from app.schemas.unit import UnitAll, UnitAllByGroup, UnitRead

router = APIRouter(prefix="/me", tags=["me"])
session_dependency = Annotated[Session, Depends(get_session)]

ALLOWED_PROFILE_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024
REPO_ROOT = Path(__file__).resolve().parents[3]
FRONTEND_PUBLIC_DIR = REPO_ROOT / "frontend" / "public"


def _detect_profile_image_content_type(file_bytes: bytes) -> str | None:
    if file_bytes.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"

    if file_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"

    if file_bytes.startswith((b"GIF87a", b"GIF89a")):
        return "image/gif"

    if (
        len(file_bytes) >= 12
        and file_bytes.startswith(b"RIFF")
        and file_bytes[8:12] == b"WEBP"
    ):
        return "image/webp"

    return None


@router.get("/units", response_model=UnitAll)
async def me_units(session: session_dependency, me: str = Depends(get_current_user)):
    results = session.exec(
        select(Unit).join(UnitEnrollment).where(UnitEnrollment.user_id == me)
    ).all()
    return UnitAll(
        units=results
    )


@router.post("/profile-image/upload", response_model=ProfileImageUploadResponse)
async def upload_profile_image(
    file: UploadFile = File(...),
    me: CurrentUser = Depends(get_current_user_with_role),
):
    if not me.is_admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Only admins can upload profile images",
        )

    file_bytes = await file.read()

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty image file",
        )

    if len(file_bytes) > MAX_PROFILE_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image file is too large",
        )

    content_type = _detect_profile_image_content_type(file_bytes)
    extension = ALLOWED_PROFILE_IMAGE_TYPES.get(content_type or "")

    if content_type is None or extension is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image type",
        )

    key = f"profile-pictures/{uuid4().hex}{extension}"

    if is_development_app_env() and not settings.aws_cdn_bucket:
        destination = FRONTEND_PUBLIC_DIR / key
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(file_bytes)
    else:
        if not settings.aws_cdn_bucket:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AWS CDN bucket is not configured",
            )

        async with aioboto3.Session().client("s3") as s3:
            await s3.put_object(
                Bucket=settings.aws_cdn_bucket,
                Key=key,
                Body=file_bytes,
                ContentType=content_type,
                CacheControl="public, max-age=31536000, immutable",
            )

    return ProfileImageUploadResponse(key=key)


@router.get("/units/active", response_model=UnitAll)
async def me_active_units(
        session: session_dependency,
        me: CurrentUser = Depends(get_current_user_with_role),
):
    today = datetime.date.today()

    statement = select(Unit)

    if not me.is_admin:
        statement = statement.join(UnitEnrollment).where(UnitEnrollment.user_id == me.user_id)

    results = session.exec(statement).all()

    filtered = [
        UnitRead.model_validate(unit)
        for unit in results
        if unit.programme.start_date <= today <= unit.programme.end_date
    ]

    return UnitAll(
        units=filtered
    )
    return UnitAll(units=filtered)


@router.get("/units-by-programme", response_model=UnitAllByGroup)
async def me_units_by_programme(
    session: session_dependency, me: str = Depends(get_current_user)
):
    results = session.exec(
        select(Programme)
        .where(Programme.units.any(Unit.enrollments.any(UnitEnrollment.user_id == me)))
        .options(
            selectinload(Programme.units),
            with_loader_criteria(
                Unit, Unit.enrollments.any(UnitEnrollment.user_id == me)
            ),
        )
    ).all()
    return UnitAllByGroup(programmes=results)


@router.get("/courseworks")
async def me_courseworks(
    session: session_dependency, me: str = Depends(get_current_user)
):
    statement = select(Unit).join(UnitEnrollment).where(UnitEnrollment.user_id == me)
    units = list(session.exec(statement))
    results = [UnitWithCourseworks.model_validate(UnitWithCourseworks(
        id=unit.id,
        unit_code=unit.unit_code,
        name=unit.name,
        programme_start_date=unit.programme.start_date,
        programme_end_date=unit.programme.end_date,
        courseworks=unit.courseworks
    )).model_dump() for unit in units]
    return results

@router.get("/courseworks/active", response_model=list[CourseworkRead])
async def me_active_courseworks(
    session: session_dependency,
    me: CurrentUser = Depends(get_current_user_with_role),
):
    # statement = select(Unit).join(UnitEnrollment).where(UnitEnrollment.user_id == me)
    # units = list(session.exec(statement))
    # results = [UnitWithCourseworks.model_validate(unit).model_dump() for unit in units]

    today = datetime.datetime.now()

    statement = select(Unit)

    if not me.is_admin:
        statement = statement.join(UnitEnrollment).where(UnitEnrollment.user_id == me.user_id)

    units = session.exec(statement).all()

    courseworks = [coursework for unit in units for coursework in unit.courseworks]
    filtered = [coursework for coursework in courseworks if coursework.due_date >= today]

    return [
        CourseworkRead.model_validate(coursework)
        for coursework in filtered
    ]

@router.get("/notifications", response_model=Notifications)
async def me_notifications(session: session_dependency, me: str = Depends(get_current_user)):
    """Sends notifications from active units"""
    my_notifications = list(session.exec(
        select(Notification).where(Notification.recipient_id == me)
    ).all())
    today = datetime.date.today()
    filtered = filter(lambda notification: notification.unit.programme.start_date <= today <= notification.unit.programme.end_date, my_notifications)

    system_notifications = []
    others: defaultdict[Unit, list] = defaultdict(list)

    for notification in filtered:
        if not notification.unit:
            system_notifications.append(ReadNotification(

            id=notification.id, title=notification.title, body=notification.body, created_at=notification.created_at, viewed=notification.viewed))
        else:
            others[notification.unit].append(ReadNotification(
                id=notification.id, title=notification.title, body=notification.body,
                created_at=notification.created_at, viewed=notification.viewed))
    units_with_notifs = []
    for unit, notifs in others.items():
        units_with_notifs.append(UnitWithNotifs(
            unit_id=unit.id,
            unit_name=unit.name,
            unit_code=unit.unit_code,
            notifications=notifs,
        ))

    return Notifications(
        system_notifications=system_notifications,
        notifications=units_with_notifs
    )

@router.get("/notifications/unread_exists", response_model=NotificationsUnreadExist)
async def me_have_unread_notifications(session: session_dependency, me: str = Depends(get_current_user)):
    # ruff: noqa e712
    result = session.scalar(exists().where(Notification.recipient_id == me).where(Notification.viewed == False).select())
    return NotificationsUnreadExist(
        have_unread_notifications=result
    )


@router.get("/notifications/mark_all_read", status_code=status.HTTP_200_OK)
async def me_mark_all_notifications_read(session: session_dependency, me: str = Depends(get_current_user)):
    me_notifs = list(session.exec(
        select(Notification).where(Notification.recipient_id == me)
        .where(Notification.viewed == False)
    ).all())

    for notification in me_notifs:
        notification.viewed = True
        session.add(notification)
        session.commit()

    me_notifs = list(session.exec(
        select(Notification).where(Notification.recipient_id == me)
        # ruff: noqa e712
        .where(Notification.viewed == False)
    ).all())
    return status.HTTP_200_OK
