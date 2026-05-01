import uuid
from datetime import datetime, timedelta
from uuid import UUID, uuid4
from unittest.mock import patch

import pytest
from fastapi.security import HTTPAuthorizationCredentials
from sqlmodel import Session, SQLModel, create_engine, select

from app.core.settings import settings
from app.models.coursework import Coursework
from app.models.programme import Programme
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.security import CurrentUser
from tests.helpers.factories import create_students, create_unit


def coursework_payload(unit_id):
    return {
        "name": "Haskell 2",
        "description": "Func language courseowrk in haskell",
        "unit_id": unit_id,
        "due_date": (datetime.now() + timedelta(days=11)).isoformat(),
        "colour": "abcdef",
    }


def coursework_updated_payload(unit_id):
    return {
        "name": "Updated",
        "description": "updated",
        "unit_id": str(unit_id),
        "due_date": (datetime.now() + timedelta(days=12)).isoformat(),
        "colour": "262626",
    }


# Each test uses a fresh database, as we use the memory version of SQLite for testing
# CREATE:
# Test successful creation of coursework through response and database
def test_coursework_create_success(client, session):
    unit_id = create_unit(session).id
    create_students(session, unit_id)

    payload = coursework_payload(
        str(unit_id)
    )  # For some reason wants it in string form
    response = client.post("/coursework/create", json=payload)

    assert response.status_code == 201
    data = response.json()

    coursework: Coursework = session.get(Coursework, UUID(data["id"]))

    # Checks
    assert data["name"] == payload["name"]
    assert data["unit_id"] == payload["unit_id"]
    assert "id" in data
    assert coursework is not None
    assert coursework.name == "Haskell 2"
    assert coursework.description == "Func language courseowrk in haskell"
    assert coursework.unit_id == unit_id
    assert coursework.colour == "abcdef"

    # check to make sure that all the students on the unit have been added as enrollments,
    # with the correct data


# Test response when creating duplicate coursework for same unit, not database
def test_coursework_create_duplicate(client, session):
    unit_id = create_unit(session).id

    payload = coursework_payload(str(unit_id))

    client.post("/coursework/create", json=payload)
    response = client.post("/coursework/create", json=payload)

    assert (
        response.status_code == 400
    )  # Error code if there is more than one of the same coursework
    assert (
        "Coursework already made that belongs to the same unit and has the same name"
        == response.json()["detail"]
    )


def test_coursework_create_unit_empty_fields(client, session):
    payload = {
        "name": None,
        "description": "Func language coursework in haskell",
        "unit_id": None,  # Non-existent unit ID
        "due_date": (datetime.now() + timedelta(days=11)).isoformat(),
        "colour": None,
    }

    response = client.post("/coursework/create", json=payload)

    assert response.status_code == 422


# GET:
# Test getting coursework that exists, through response not database
def test_get_coursework_success(client, session):
    unit_id = create_unit(session).id

    payload = coursework_payload(str(unit_id))
    createResponse = client.post(
        "/coursework/create", json=payload
    )  # Need response to get the ID of the coursework

    coursework_id = createResponse.json()["id"]
    response = client.get(f"/coursework/{coursework_id}")

    assert response.status_code == 200
    assert response.json()["id"] == coursework_id


def test_get_coursework_empty_fields(client, session):
    unit_id = create_unit(session).id

    payload = coursework_payload(str(unit_id))
    client.post(
        "/coursework/create", json=payload
    )  # Need response to get the ID of the coursework

    response = client.get("/coursework/")

    assert response.status_code == 404


# Test getting coursework that doesn't exist, through response not database
def test_get_coursework_not_found(client):
    response = client.get(f"/coursework/{uuid4()}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Coursework not found"


# UPDATE:
# Testing through response and database that updating coursework works
def test_update_coursework_success(client, session):
    unit_id = create_unit(session).id

    payload = coursework_payload(str(unit_id))
    createResponse = client.post("/coursework/create", json=payload)
    coursework_id = createResponse.json()["id"]

    updatedPayload = {"name": "Haskell 3", "description": "The better coursework"}

    response = client.put(f"/coursework/{coursework_id}", json=updatedPayload)

    coursework = session.get(Coursework, UUID(coursework_id))

    assert response.status_code == 200
    assert response.json()["name"] == "Haskell 3"
    assert response.json()["description"] == "The better coursework"
    assert coursework.name == "Haskell 3"
    assert coursework.description == "The better coursework"


# Testing response when trying to update coursework that doesn't exist
def test_update_coursework_not_found(client):
    response = client.put(f"/coursework/{uuid4()}", json={"name": "Irrelevant stuffff"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Coursework not found"


# Test through response when trying to update coursework to belong to a unit that doesn't exist
def test_update_coursework_unit_not_found(client, session):
    unit_id = create_unit(session).id

    payload = coursework_payload(str(unit_id))
    createResponse = client.post("/coursework/create", json=payload)
    coursework_id = createResponse.json()["id"]

    response = client.put(
        f"/coursework/{coursework_id}", json={"unit_id": str(uuid4())}
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Corresponding unit not found"


# DELETE:
# Test deletion of coursework through response and database
def test_delete_coursework_success(client, session):
    unit_id = create_unit(session).id

    payload = coursework_payload(str(unit_id))
    createResponse = client.post("/coursework/create", json=payload)
    coursework_id = createResponse.json()["id"]

    response = client.delete(f"/coursework/{coursework_id}")

    assert response.status_code == 200
    assert response.json()["deletion_successful"] is True
    assert response.json()["id"] == coursework_id

    # verify it is actually deleted
    get_resp = client.get(
        f"/coursework/{coursework_id}"
    )  # Tests teh databse implicitly through as get is already verified
    assert get_resp.status_code == 404


# Tests through response when trying to delete coursework that doesn't exist
def test_delete_coursework_not_found(client):
    response = client.delete(f"/coursework/{uuid4()}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Coursework not found"


def test_update_coursework_works(client, session):
    unit_id = create_unit(session).id

    payload = coursework_payload(str(unit_id))
    createResponse = client.post("/coursework/create", json=payload)
    coursework_id = createResponse.json()["id"]

    np = coursework_updated_payload(unit_id)
    response = client.put(f"/coursework/{coursework_id}", json=np)
    assert response.status_code == 200
    assert response.json()["unit_id"] == str(unit_id)
    assert response.json()["name"] == np["name"]
    assert response.json()["description"] == np["description"]
    assert response.json()["due_date"] == np["due_date"]
    assert response.json()["colour"] == np["colour"]

    id = uuid.UUID(response.json()["id"])
    g = session.get(Coursework, id)
    assert g.name == np["name"]


def test_update_coursework_data(client, session):
    unit_id = create_unit(session).id

    np = coursework_payload(str(unit_id))
    createResponse = client.post("/coursework/create", json=np)
    coursework_id = createResponse.json()["id"]

    response = client.get(f"/coursework/{coursework_id}/update_form_data")
    assert response.status_code == 200
    assert response.json()["unit_id"] == str(unit_id)
    assert response.json()["name"] == response.json()["name"]
    assert response.json()["description"] == response.json()["description"]
    assert response.json()["due_date"] == response.json()["due_date"]
    assert response.json()["colour"] == response.json()["colour"]

    id = uuid.UUID(response.json()["id"])
    g = session.get(Coursework, id)
    assert g.name == np["name"]


def test_get_coursework_scopes(client, session):
    unit_id = create_unit(session).id

    payload = coursework_payload(str(unit_id))
    create_response = client.post("/coursework/create", json=payload)
    coursework_id = create_response.json()["id"]

    response = client.get(f"/coursework/{coursework_id}/scopes")

    assert response.status_code == 200
    scopes = response.json()["scopes"]
    assert "unit:read" in scopes
    assert "unit:coursework_gitlab" in scopes


def test_template_files_requires_coursework_gitlab_scope(client, session):
    previous_ignore_auth = settings.ignore_auth
    settings.ignore_auth = False

    try:
        unit_id = create_unit(session).id
        requesting_user = "student-user"
        session.add(UnitEnrollment(unit_id=unit_id, user_id=requesting_user, type="student"))
        coursework = Coursework(
            name="Template scoped",
            description="Test",
            unit_id=unit_id,
            due_date=datetime.now() + timedelta(days=11),
            colour="abcdef",
            gitlab_id="123456",
            template_id=98765,
        )
        session.add(coursework)
        session.commit()

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
            return_value=CurrentUser(user_id=requesting_user, role="user"),
        ):
            response = client.get("/coursework/template/files?templateId=98765")

        assert response.status_code == 401
        assert "Missing scopes" in response.json()["detail"]
    finally:
        settings.ignore_auth = previous_ignore_auth
        from app.core.security import get_bearer
        from app.main import app

        app.dependency_overrides.pop(get_bearer, None)


def test_template_upload_requires_coursework_gitlab_scope(client, session):
    previous_ignore_auth = settings.ignore_auth
    settings.ignore_auth = False

    try:
        unit_id = create_unit(session).id
        requesting_user = "student-user"
        session.add(UnitEnrollment(unit_id=unit_id, user_id=requesting_user, type="student"))
        coursework = Coursework(
            name="Upload scoped",
            description="Test",
            unit_id=unit_id,
            due_date=datetime.now() + timedelta(days=11),
            colour="abcdef",
            gitlab_id="123456",
        )
        session.add(coursework)
        session.commit()
        session.refresh(coursework)

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
            return_value=CurrentUser(user_id=requesting_user, role="user"),
        ):
            response = client.post(
                f"/coursework/{coursework.id}/template/upload-zip",
                files={"file": ("template.zip", b"PK\x05\x06" + b"\x00" * 18, "application/zip")},
            )

        assert response.status_code == 401
        assert "Missing scopes" in response.json()["detail"]
    finally:
        settings.ignore_auth = previous_ignore_auth
        from app.core.security import get_bearer
        from app.main import app

        app.dependency_overrides.pop(get_bearer, None)


def test_locked_unit_rejects_student_coursework_access(client, session):
    previous_ignore_auth = settings.ignore_auth
    settings.ignore_auth = False

    try:
        unit_id = create_unit(session).id
        unit = session.get(Unit, unit_id)
        unit.unlocked = False
        requesting_user = "student-user"
        session.add(unit)
        session.add(UnitEnrollment(unit_id=unit_id, user_id=requesting_user, type="student"))
        coursework = Coursework(
            name="Locked unit coursework",
            description="Test",
            unit_id=unit_id,
            due_date=datetime.now() + timedelta(days=11),
            colour="abcdef",
            gitlab_id="123456",
        )
        session.add(coursework)
        session.commit()
        session.refresh(coursework)

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
            return_value=CurrentUser(user_id=requesting_user, role="user"),
        ):
            scopes_response = client.get(f"/coursework/{coursework.id}/scopes")
            detail_response = client.get(f"/coursework/{coursework.id}")

        assert scopes_response.status_code == 200
        assert "unit:read" not in scopes_response.json()["scopes"]
        assert detail_response.status_code == 401
        assert "Missing scopes" in detail_response.json()["detail"]
    finally:
        settings.ignore_auth = previous_ignore_auth
        from app.core.security import get_bearer
        from app.main import app

        app.dependency_overrides.pop(get_bearer, None)
