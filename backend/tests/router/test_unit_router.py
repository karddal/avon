
import pytest
from pydantic import ValidationError
from sqlmodel import SQLModel, Session, create_engine, select
from uuid import uuid4, UUID
from datetime import datetime, timedelta
from contextlib import nullcontext as does_not_raise
from app.models.programme import Programme
from app.models.unit import Unit
from app.schemas.unit import UnitCreate


def create_programme(session) -> UUID:
    programme = Programme(id=uuid4(), name="Test Programme",start_date=datetime.now(), end_date=datetime.today() + timedelta(days=365))
    session.add(programme)
    session.commit()
    # unit_id = uuid4()
    # unit = Unit(id=unit_id, name="Test Unit", description="Test description", unit_code="COMS20017", colour="abcdef", programme_id=programme.id,)
    # session.add(unit)
    # session.commit()
    return programme.id

def create_unit(session, programme_id) -> UUID:
    unit_id = uuid4()
    unit = Unit(id=unit_id, name="Test Unit", description="Test description", unit_code="COMS20017", colour="abcdef", programme_id=programme_id,)
    session.add(unit)
    session.commit()
    return unit_id

def valid_unit_payload(programme_id):
    return {
        "name":"Imperative and Functional Programming",
        "description":"Intro to coding",
        "unit_code":"COMS10015",
        "colour":"abcdef",
        "programme_id":programme_id
    }

def incomplete_payload(programme_id):
    return {
        "name":"Imperative and Functional Programming",
        "description":"Intro to coding",
        "colour":"abcdef",
        "programme_id":programme_id
    }

def invalid_programme_id(programme_id):
    return {
        "name":"Imperative and Functional Programming",
        "description":"Intro to coding",
        "unit_code":"COMS10015",
        "colour":"abcdef",
        "programme_id": "bec07dbc-08aa-4b26-b1c7-aed9e13496cb"
    }


## Tests to create units
# Valid test
def test_create_valid_unit(client, session):
    programme_id = create_programme(session)
    payload = valid_unit_payload(str(programme_id))

    response = client.post("/units/create", json=payload)
    assert response.status_code == 201
    data = response.json()

    # response checks
    assert data["name"] == payload["name"]
    assert data["programme_id"] == payload["programme_id"]
    
    # Query the database and check if the object exists
    statement = select(Unit).where(Unit.name == data["name"])
    units = session.exec(statement).all()

    assert len(units) == 1
    assert units[0].id is not None    
    assert str(units[0].programme_id) == data["programme_id"]

# Invalid test
def test_invalid_unit_data(client, session):
    programme_id = create_programme(session)
    payload = incomplete_payload(str(programme_id))

    response = client.post("/units/create", json=payload)
    assert response.status_code == 422

# Create same unit twice
def test_create_same_unit_twice(client, session):
    programme_id = create_programme(session)
    payload = valid_unit_payload(str(programme_id))

    response1 = client.post("/units/create", json=payload)
    response2 = client.post("/units/create", json=payload)
    assert response2.status_code == 400
    # response2 = client.post("")

# Invalid programme id doesn't make a unit
def test_invalid_programme_id(client, session):
    programme_id = create_programme(session)
    payload = invalid_programme_id(str(programme_id))

    response = client.post("/units/create", json=payload)

    assert response.status_code == 400

## Tests to get unit details
# Tests to get unit with valid details
def test_get_valid_unit_details(client, session):
    programme_id = create_programme(session)
    unit_id = create_unit(session, programme_id)
    response = client.get("/units/" + str(unit_id))
    data = response.json()

    assert response.status_code == 200
    assert data["name"] == "Test Unit"
    assert data["unit_code"] == "COMS20017"
    assert data["programme_id"] == str(programme_id)

# Test to get unit with invalid details
def test_get_invalid_unit_details(client, session):
    invalid_unit_id = "bec07dbc-08aa-4b26-b1c7-aed9e13496cb"
    response = client.get("/units/"+invalid_unit_id)

    assert response.status_code == 404

# Tests to get units with dates


# Tests to get the lecturers of the units
# Tests to update units
# Tests to delete units
# Tests to get units taken by a specific person
# Tests to get courseworks from a unit
# Tests to get all units