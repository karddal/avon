
from datetime import datetime, timedelta
from uuid import UUID, uuid4

import pytest
from helpers.factories import create_notification as notification_create_helper

from app.core.security import get_current_user
from app.main import app
from app.models.coursework import Coursework
from app.models.programme import Programme
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from tests.helpers.factories import (
    create_coursework,
    create_lecturers,
    create_programme,
    create_students,
    create_unit,
)


def test_me_units(session, client):
    unit = create_unit(session)

    user = create_students(session, unit.id)

    app.dependency_overrides[get_current_user] = lambda: user.user_id

    response = client.get("/me/units")
    assert response.status_code == 200

    data = response.json()
    assert data["units"][0]["name"] == unit.name

def test_me_active_units(session, client, auth_override_with_role):
    unit = create_unit(session)

    user = create_students(session, unit.id)

    auth_override_with_role(user.user_id)

    response = client.get("/me/units/active")
    assert response.status_code == 200

    data = response.json()
    assert data["units"][0]["name"] == unit.name

def test_me_units_by_programme(session, client):
    unit = create_unit(session)

    user = create_students(session, unit.id)

    app.dependency_overrides[get_current_user] = lambda: user.user_id

    response = client.get("/me/units-by-programme")
    assert response.status_code == 200

    programme = session.get(Programme, unit.programme_id)

    data = response.json()
    assert data["programmes"][0]["name"]  == programme.name

def test_me_courseworks(session, client):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)

    user = create_students(session, unit.id)

    app.dependency_overrides[get_current_user] = lambda: user.user_id

    response = client.get("/me/courseworks")
    assert response.status_code == 200

    data = response.json()
    assert data[0]["courseworks"][0]["name"] == coursework.name

def test_me_active_courseworks(session, client, auth_override_with_role):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)

    user = create_students(session, unit.id)

    auth_override_with_role(user.user_id)

    response = client.get("/me/courseworks/active")
    assert response.status_code == 200

    data = response.json()
    assert data[0]["name"] == coursework.name

def test_me_notifications_with_added(session, client):
    notification = notification_create_helper(session)
    # mock the auth so we get the right me routes
    app.dependency_overrides[get_current_user] = lambda: notification.recipient_id
    response = client.get("/me/notifications")
    assert response.status_code == 200

    data = response.json()
    assert data["notifications"][0]["unit_name"] == "Test Unit"
    assert data["notifications"][0]["notifications"][0]["title"] == "Test Notification"

def test_me_unread_notifications(session, client):
    notification = notification_create_helper(session)
    # mock the auth so we get the right me routes
    app.dependency_overrides[get_current_user] = lambda: notification.recipient_id
    response = client.get("/me/notifications/unread_exists")
    assert response.status_code == 200

    data = response.json()
    assert data["have_unread_notifications"]

def test_me_mark_all_read(session, client):
    notification = notification_create_helper(session)
    # mock the auth so we get the right me routes
    app.dependency_overrides[get_current_user] = lambda: notification.recipient_id
    response = client.get("/me/notifications/unread_exists")
    assert response.status_code == 200

    data = response.json()
    assert data["have_unread_notifications"]

    client.get("/me/notifications/mark_all_read")
    response = client.get("/me/notifications/unread_exists")
    assert response.status_code == 200

    data = response.json()
    assert not data["have_unread_notifications"]

def test_me_unread_notifications_no_unread(session, client):
    # mock the auth so we get the right me routes
    unit = create_unit(session)

    user = create_students(session, unit.id)
    app.dependency_overrides[get_current_user] = lambda: user.user_id
    response = client.get("/me/notifications/unread_exists")
    assert response.status_code == 200

    data = response.json()
    assert not data["have_unread_notifications"]

def test_me_notifications_empty(session, client):
    # mock the auth so we get the right me routes
    unit = create_unit(session)

    user = create_students(session, unit.id)
    app.dependency_overrides[get_current_user] = lambda: user.user_id
    response = client.get("/me/notifications")
    assert response.status_code == 200

    data = response.json()
    assert len(data["notifications"]) == 0
    assert len(data["system_notifications"]) == 0
