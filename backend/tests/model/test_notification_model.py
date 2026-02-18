from datetime import date, datetime, timedelta
from uuid import UUID, uuid4

from helpers.factories import create_notification, create_unit
from sqlmodel import Session, SQLModel, create_engine, select

from app.models.notification import Notification


def test_notification_model_auto_populates(session):
    user_id = str(uuid4())
    unit = create_unit(session)
    notification = Notification(
        recipient_id=user_id,
        unit_id=unit.id,
        title="Test Notification",
        body="Test Body")

    session.add(notification)
    session.commit()
    session.refresh(notification)

    assert isinstance(notification.id, UUID)
    assert isinstance(notification.created_at, datetime)
    assert not notification.viewed
