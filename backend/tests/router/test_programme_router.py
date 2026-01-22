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