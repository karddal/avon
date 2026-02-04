
import pytest
from uuid import uuid4, UUID
from datetime import datetime, timedelta
from app.models.coursework import Coursework
from app.models.programme import Programme
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.main import app
from app.core.security import get_current_user
from helpers.factories import create_notification as notification_create_helper


def create_programme(session) -> Programme:
    programme = Programme(id=uuid4(), name="Test Programme",start_date=datetime.now(), end_date=datetime.today() + timedelta(days=365))
    session.add(programme)
    session.commit()
    return programme

def create_unit(session, programme_id) -> Unit:
    unit_id = uuid4()
    unit = Unit(id=unit_id, name="Test Unit", description="Test description", unit_code="COMS20017", colour="abcdef", programme_id=programme_id,)
    session.add(unit)
    session.commit()
    return unit

def create_lecturers(session, unit_id) -> UnitEnrollment:
    user_id = str(uuid4())
    unit_enrollment = UnitEnrollment(unit_id=unit_id, user_id=user_id, type="lecturer")
    session.add(unit_enrollment)
    session.commit()
    return unit_enrollment

def create_students(session, unit_id) -> UnitEnrollment:
    user_id = str(uuid4())
    unit_enrollment = UnitEnrollment(unit_id=unit_id, user_id=user_id, type="student")
    session.add(unit_enrollment)
    session.commit()
    return unit_enrollment

def create_coursework(session, unit_id) -> Coursework:
    coursework_id = uuid4()
    coursework = Coursework(id=coursework_id, name="Test coursework", description="Test description", unit_id=unit_id, due_date=datetime.today() + timedelta(days=365), colour="abcdef")
    session.add(coursework)
    session.commit()
    return coursework

def create_unit_with_programme(session) -> UUID:
    programme = Programme(id=uuid4(), name="Test Programme",start_date=datetime.now(), end_date=datetime.today() + timedelta(days=365))
    session.add(programme)
    session.commit()
    unit_id = uuid4()
    unit = Unit(id=unit_id, name="Test Unit", description="Test description", unit_code="COMS20017", colour="abcdef", programme_id=programme.id,)
    session.add(unit)
    session.commit()

    return unit_id

def test_me_units(session, client):
    programme = create_programme(session)
    unit = create_unit(session, programme.id)

    user = create_students(session, unit.id)

    app.dependency_overrides[get_current_user] = lambda: user.user_id

    response = client.get("/me/units")
    assert response.status_code == 200

    data = response.json()
    assert data["units"][0]["name"] == unit.name

def test_me_active_units(session, client):
    programme = create_programme(session)
    unit = create_unit(session, programme.id)

    user = create_students(session, unit.id)

    app.dependency_overrides[get_current_user] = lambda: user.user_id

    response = client.get("/me/units/active")
    assert response.status_code == 200
    
    data = response.json()
    assert data["units"][0]["name"] == unit.name

def test_me_units_by_programme(session, client):
    programme = create_programme(session)
    unit = create_unit(session, programme.id)

    user = create_students(session, unit.id)

    app.dependency_overrides[get_current_user] = lambda: user.user_id

    response = client.get("/me/units-by-programme")
    assert response.status_code == 200
    
    data = response.json()
    assert data["programmes"][0]["name"]  == programme.name

def test_me_courseworks(session, client):
    programme = create_programme(session)
    unit = create_unit(session, programme.id)
    coursework = create_coursework(session, unit.id)

    user = create_students(session, unit.id)

    app.dependency_overrides[get_current_user] = lambda: user.user_id

    response = client.get("/me/courseworks")
    assert response.status_code == 200
    
    data = response.json()
    assert data[0]["courseworks"][0]["name"] == coursework.name
    
def test_me_active_courseworks(session, client):
    programme = create_programme(session)
    unit = create_unit(session, programme.id)
    coursework = create_coursework(session, unit.id)

    user = create_students(session, unit.id)

    app.dependency_overrides[get_current_user] = lambda: user.user_id

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
    programme = create_programme(session)
    unit = create_unit(session, programme.id)

    user = create_students(session, unit.id)
    app.dependency_overrides[get_current_user] = lambda: user.user_id
    response = client.get("/me/notifications/unread_exists")
    assert response.status_code == 200

    data = response.json()
    assert not data["have_unread_notifications"]

def test_me_notifications_empty(session, client):
    # mock the auth so we get the right me routes
    programme = create_programme(session)
    unit = create_unit(session, programme.id)

    user = create_students(session, unit.id)
    app.dependency_overrides[get_current_user] = lambda: user.user_id
    response = client.get("/me/notifications")
    assert response.status_code == 200

    data = response.json()
    assert len(data["notifications"]) == 0
    assert len(data["system_notifications"]) == 0






