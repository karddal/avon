from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi import HTTPException
from sqlmodel import select

from app.models.notification import Notification
from app.models.unit_enrollment import UnitEnrollment
from app.routers import notification as notification_router
from app.schemas.notification import CreateNotification
from tests.helpers.factories import create_notification, create_unit


@pytest.fixture
def token():
    return SimpleNamespace(credentials="token")


@pytest.fixture(autouse=True)
def allow_scope(monkeypatch):
    async def allowed(*args, **kwargs):
        return None

    monkeypatch.setattr(notification_router, "require_scopes", allowed)


@pytest.mark.asyncio
async def test_get_notification_returns_full_info_for_recipient(session):
    notification = create_notification(session)

    result = await notification_router.get_notification(
        str(notification.id),
        session,
        me=notification.recipient_id,
    )

    assert result.id == notification.id
    assert result.unit.unit_id == notification.unit_id
    assert result.title == notification.title


@pytest.mark.asyncio
async def test_get_notification_404s_for_missing_notification(session):
    with pytest.raises(HTTPException) as exc:
        await notification_router.get_notification(str(uuid4()), session, me="user")

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_get_notification_403s_for_other_recipient(session):
    notification = create_notification(session)

    with pytest.raises(HTTPException) as exc:
        await notification_router.get_notification(
            str(notification.id),
            session,
            me="other-user",
        )

    assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_mark_as_read_updates_notification(session):
    notification = create_notification(session)

    response = await notification_router.mark_as_read(
        str(notification.id),
        session,
        me=notification.recipient_id,
    )

    session.refresh(notification)
    assert response == 200
    assert notification.viewed is True


@pytest.mark.asyncio
async def test_mark_as_read_403s_for_other_recipient(session):
    notification = create_notification(session)

    with pytest.raises(HTTPException) as exc:
        await notification_router.mark_as_read(
            str(notification.id),
            session,
            me="other-user",
        )

    assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_create_notification_adds_notifications_for_students_only(
    session, token
):
    unit = create_unit(session)
    session.add(UnitEnrollment(unit_id=unit.id, user_id="student-1", type="student"))
    session.add(UnitEnrollment(unit_id=unit.id, user_id="lecturer-1", type="lecturer"))
    session.commit()

    response = await notification_router.create_notification(
        CreateNotification(
            unit_id=str(unit.id),
            title="Announcement",
            body="Read this",
        ),
        session,
        token,
        me="lecturer-1",
    )

    notifications = session.exec(select(Notification)).all()
    assert response == 201
    assert [notification.recipient_id for notification in notifications] == [
        "student-1"
    ]


@pytest.mark.asyncio
async def test_create_notification_404s_for_missing_unit(session, token):
    with pytest.raises(HTTPException) as exc:
        await notification_router.create_notification(
            CreateNotification(
                unit_id=str(uuid4()),
                title="Announcement",
                body="Read this",
            ),
            session,
            token,
            me="lecturer-1",
        )

    assert exc.value.status_code == 404
