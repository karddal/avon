import pytest
from uuid import uuid4, UUID
from datetime import date, timedelta

from app.models.programme import Programme

def programme_payload():
    start = date.today() + timedelta(days=1)
    end = date.today() + timedelta(days=365)

    return {
        "name": "Year 2 2025/2026",
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
    }

# Each test uses a fresh database, as we use the memory version of SQLite for testing
# CREATE:
# Test successful creation of Programme through response and database
def test_programme_create_success(client, session):
    payload = programme_payload() # For some reason wants it in string form
    response = client.post("/programmes/create", json=payload)

    assert response.status_code == 201
    data = response.json()

    programme = session.get(Programme, UUID(data["id"]))

    # Checks
    assert data["name"] == payload["name"]
    assert "id" in data
    assert programme is not None
    assert programme.name == "Year 2 2025/2026"
    assert programme.start_date.isoformat() == payload["start_date"]
    assert programme.end_date.isoformat() == payload["end_date"]

# Test response when creating duplicate Programme with same name, not testing database
def test_programme_create_duplicate(client, session):
    payload = programme_payload()

    client.post("/programmes/create", json=payload)
    response = client.post("/programmes/create", json=payload)

    assert response.status_code == 400 # Error code if there is more than one of the same programme
    assert "Programme already exists" == response.json()["detail"]

# GET:
# Test getting programme that exists, through response not database
def test_get_programme_success(client, session):
    payload = programme_payload()
    createResponse = client.post("/programmes/create", json=payload)

    programme_id = createResponse.json()["id"]
    response = client.get(f"/programmes/{programme_id}")

    assert response.status_code == 200
    assert response.json()["id"] == programme_id

# Test getting programme that doesn't exist, through response not database
def test_get_programme_not_found(client):
    response = client.get(f"/programmes/{uuid4()}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Programme not found"

# UPDATE:
# Testing through response and database that updating programme works
from datetime import date, timedelta
from uuid import UUID


def test_update_programme_success(client, session):
    payload = programme_payload()
    createResponse = client.post("/programmes/create", json=payload)
    programme_id = createResponse.json()["id"]

    start = date.today() + timedelta(days=1)
    end = date.today() + timedelta(days=365)

    updatedPayload = {"name": "Year 3 2025/2026", "start_date": start.isoformat(), "end_date": end.isoformat()}

    response = client.put(f"/programmes/{programme_id}", json=updatedPayload)

    programme = session.get(Programme, UUID(programme_id))

    assert response.status_code == 200
    assert response.json()["name"] == "Year 3 2025/2026"
    assert response.json()["start_date"] == start.isoformat()
    assert response.json()["end_date"] == end.isoformat()
    assert programme.name == "Year 3 2025/2026"
    assert programme.start_date.isoformat() == start.isoformat()
    assert programme.end_date.isoformat() == end.isoformat()

# Testing response when trying to update programme that doesn't exist
def test_update_programme_not_found(client):
    response = client.put(f"/programmes/{uuid4()}", json={"name": "Irrelevant stuffff"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Programme not found"

# DELETE:
# Test deletion of programme through response and database
def test_delete_programme_success(client, session):
    payload = programme_payload()
    createResponse = client.post("/programmes/create", json=payload)
    programme_id = createResponse.json()["id"]

    response = client.delete(f"/programmes/{programme_id}")

    assert response.status_code == 200
    assert response.json()["deletion_successful"] is True
    assert response.json()["id"] == programme_id

    # verify it is actually deleted
    get_resp = client.get(f"/programmes/{programme_id}") # Tests the database implicitly through as get is already verified
    assert get_resp.status_code == 404

# Tests through response when trying to delete programme that doesn't exist
def test_delete_programme_not_found(client):
    response = client.delete(f"/programmes/{uuid4()}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Programme not found"