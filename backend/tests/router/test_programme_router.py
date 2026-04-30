import pytest
from unittest.mock import patch
from uuid import uuid4, UUID
from datetime import date, timedelta

from fastapi.security import HTTPAuthorizationCredentials

from app.core.settings import settings
from app.models.programme import Programme
from app.schemas.security import CurrentUser


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
    payload = programme_payload()  # For some reason wants it in string form
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


def test_programme_create_empty_name(client, session):
    payload = {
        "name": None,
        "start_date": (date.today() + timedelta(days=1)).isoformat(),
        "end_date": (date.today() + timedelta(days=365)).isoformat(),
    }

    response = client.post("/programmes/create", json=payload)

    assert response.status_code == 422


def test_programme_create_invalid_dates(client, session):
    payload = {
        "name": "Year 2 2025/2026",
        "start_date": "invalid-date-format",
        "end_date": (date.today() + timedelta(days=365)).isoformat(),
    }
    response = client.post("/programmes/create", json=payload)
    assert response.status_code == 422


# Test response when creating duplicate Programme with same name, not testing database
def test_programme_create_duplicate(client, session):
    payload = programme_payload()

    client.post("/programmes/create", json=payload)
    response = client.post("/programmes/create", json=payload)

    assert (
        response.status_code == 400
    )  # Error code if there is more than one of the same programme
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


def test_update_programme_success(client, session):
    payload = programme_payload()
    createResponse = client.post("/programmes/create", json=payload)
    programme_id = createResponse.json()["id"]

    start = date.today() + timedelta(days=1)
    end = date.today() + timedelta(days=365)

    updatedPayload = {
        "name": "Year 3 2025/2026",
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
    }

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
    get_resp = client.get(
        f"/programmes/{programme_id}"
    )  # Tests the database implicitly through as get is already verified
    assert get_resp.status_code == 404


# Tests through response when trying to delete programme that doesn't exist
def test_delete_programme_not_found(client):
    response = client.delete(f"/programmes/{uuid4()}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Programme not found"


def test_create_programme_rejects_non_admin(client, session):
    previous_ignore_auth = settings.ignore_auth
    settings.ignore_auth = False

    try:
        fake_token = HTTPAuthorizationCredentials(
            scheme="Bearer",
            credentials="fake.jwt.token",
        )

        def override_get_bearer():
            yield fake_token

        from app.core.security import get_bearer
        from app.main import app

        app.dependency_overrides[get_bearer] = override_get_bearer

        with patch(
            "app.core.scopes.scopes.verify_token_and_get_user",
            return_value=CurrentUser(user_id="lecturer-user", role="lecturer"),
        ):
            response = client.post("/programmes/create", json=programme_payload())

        assert response.status_code == 401
        assert "Not correct role" in response.json()["detail"]
    finally:
        settings.ignore_auth = previous_ignore_auth
        from app.core.security import get_bearer
        from app.main import app

        app.dependency_overrides.pop(get_bearer, None)


def test_list_programmes_rejects_non_admin(client, session):
    previous_ignore_auth = settings.ignore_auth
    settings.ignore_auth = False

    try:
        fake_token = HTTPAuthorizationCredentials(
            scheme="Bearer",
            credentials="fake.jwt.token",
        )

        def override_get_bearer():
            yield fake_token

        from app.core.security import get_bearer
        from app.main import app

        app.dependency_overrides[get_bearer] = override_get_bearer

        with patch(
            "app.core.scopes.scopes.verify_token_and_get_user",
            return_value=CurrentUser(user_id="lecturer-user", role="lecturer"),
        ):
            response = client.get("/programmes/")

        assert response.status_code == 401
        assert "Not correct role" in response.json()["detail"]
    finally:
        settings.ignore_auth = previous_ignore_auth
        from app.core.security import get_bearer
        from app.main import app

        app.dependency_overrides.pop(get_bearer, None)
