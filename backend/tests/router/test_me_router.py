
import pytest
from uuid import uuid4, UUID
from datetime import datetime, timedelta
from app.models.coursework import Coursework
from app.models.programme import Programme
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.main import app
from app.core.security import get_current_user
from tests.helpers.factories import create_programme, create_unit, create_students, create_lecturers, create_coursework

def test_me_units(session, client):
    unit = create_unit(session)

    user = create_students(session, unit.id)

    app.dependency_overrides[get_current_user] = lambda: user.user_id

    response = client.get("/me/units")
    assert response.status_code == 200

    data = response.json()
    assert data["units"][0]["name"] == unit.name

def test_me_active_units(session, client):
    unit = create_unit(session)

    user = create_students(session, unit.id)

    app.dependency_overrides[get_current_user] = lambda: user.user_id

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
    
def test_me_active_courseworks(session, client):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)

    user = create_students(session, unit.id)

    app.dependency_overrides[get_current_user] = lambda: user.user_id

    response = client.get("/me/courseworks/active")
    assert response.status_code == 200
    
    data = response.json()
    assert data[0]["name"] == coursework.name
    





