import pytest
from sqlmodel import SQLModel, Session, create_engine, select
from uuid import uuid4, UUID
from datetime import datetime, timedelta

from app.models.coursework import Coursework
from app.models.unit import Unit
from app.models.programme import Programme
from app.models.unit_enrollment import UnitEnrollment


# Helper Funcs:
def create_unit_with_programme(session) -> UUID:
    programme = Programme(id=uuid4(), name="Test Programme",start_date=datetime.now(), end_date=datetime.today() + timedelta(days=365))
    session.add(programme)
    session.commit()
    unit_id = uuid4()
    unit = Unit(id=unit_id, name="Test Unit", description="Test description", unit_code="COMS20017", colour="abcdef", programme_id=programme.id,)
    session.add(unit)
    session.commit()

    return unit_id

def coursework_payload(unit_id):
    return {
        "name": "Haskell 2",
        "description": "Func language courseowrk in haskell",
        "unit_id": unit_id,
        "due_date": (datetime.now() + timedelta(days=11)).isoformat(),
        "colour": "abcdef",
    }


# Each test uses a fresh database, as we use the memory version of SQLite for testing
# CREATE:
def test_coursework_create_success(client, session):
    unit_id = create_unit_with_programme(session)

    payload = coursework_payload(str(unit_id)) # For some reason wants it in string form
    response = client.post("/coursework/create", json=payload)

    assert response.status_code == 201
    data = response.json()

    # Checks
    assert data["name"] == payload["name"]
    assert data["unit_id"] == payload["unit_id"]
    assert "id" in data

def test_coursework_create_duplicate(client, session):
    unit_id = create_unit_with_programme(session)

    payload = coursework_payload(str(unit_id))

    client.post("/coursework/create", json=payload)
    response = client.post("/coursework/create", json=payload)

    assert response.status_code == 400 # Error code if there is more than one of the same coursework
    assert "Coursework already made that belongs to the same unit and has the same name" == response.json()["detail"]

def test_get_coursework_success(client, session):
    unit_id = create_unit_with_programme(session)

    payload = coursework_payload(str(unit_id))
    createResponse = client.post("/coursework/create", json=payload)  # Need response to get the ID of the coursework

    coursework_id = createResponse.json()["id"]
    response = client.get(f"/coursework/{coursework_id}")

    assert response.status_code == 200
    assert response.json()["id"] == coursework_id

# GET:
def test_get_coursework_not_found(client):
    response = client.get(f"/coursework/{uuid4()}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Coursework not found"

# UPDATE:
def test_update_coursework_success(client, session):
    unit_id = create_unit_with_programme(session)

    payload = coursework_payload(str(unit_id))
    createResponse = client.post("/coursework/create", json=payload)
    coursework_id = createResponse.json()["id"]

    updatedPayload = {"name": "Haskell 3", "description": "The better coursework"}

    response = client.put(f"/coursework/{coursework_id}", json=updatedPayload)

    assert response.status_code == 200
    assert response.json()["name"] == "Haskell 3"
    assert response.json()["description"] == "The better coursework"


def test_update_coursework_not_found(client):
    response = client.put(f"/coursework/{uuid4()}", json={"name": "Irrelevant stuffff"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Coursework not found"


def test_update_coursework_unit_not_found(client, session):
    unit_id = create_unit_with_programme(session)

    payload = coursework_payload(str(unit_id))
    createResponse = client.post("/coursework/create", json=payload)
    coursework_id = createResponse.json()["id"]

    response = client.put(f"/coursework/{coursework_id}", json={"unit_id": str(uuid4())})

    assert response.status_code == 404
    assert response.json()["detail"] == "Corresponding unit not found"

# DELETE:
def test_delete_coursework_success(client, session):
    unit_id = create_unit_with_programme(session)

    payload = coursework_payload(str(unit_id))
    createResponse = client.post("/coursework/create", json=payload)
    coursework_id = createResponse.json()["id"]

    response = client.delete(f"/coursework/{coursework_id}")

    assert response.status_code == 200
    assert response.json()["deletion_successful"] is True
    assert response.json()["id"] == coursework_id

    # verify it is actually deleted
    get_resp = client.get(f"/coursework/{coursework_id}")
    assert get_resp.status_code == 404


def test_delete_coursework_not_found(client):
    response = client.delete(f"/coursework/{uuid4()}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Coursework not found"