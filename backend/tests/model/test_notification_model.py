from sqlmodel import SQLModel, Session, create_engine, select
from uuid import uuid4, UUID
from datetime import datetime, timedelta, date

from app.models.notification import Notification
from helpers.factories import create_notification, create_unit


def test_notification_model_auto_populates(session):
    user_id = str(uuid4())
    unit = create_unit(session)
    notification = Notification(
        recipient_id=user_id,
        unit_id=unit,
        title="Test Notification",
        body="Test Body")

    session.add(notification)
    session.commit()
    session.refresh(notification)

    assert isinstance(notification.id, UUID)
    assert isinstance(notification.created_at, datetime)
    assert not notification.viewed


