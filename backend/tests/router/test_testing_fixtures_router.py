import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel, Session, create_engine, select

from app.core.settings import settings
from app.core.testing import ensure_test_fixture_key_configured
from app.db.session import get_session
from app.models.coursework import Coursework
from app.models.programme import Programme
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.routers.testing_fixtures import router


@pytest.fixture
def testing_fixture_client(monkeypatch):
    monkeypatch.setattr(settings, "enable_test_fixtures", True)
    monkeypatch.setattr(settings, "test_fixture_key", "fixture-key")

    engine = create_engine(
        "sqlite:///:memory:",
        echo=False,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    app = FastAPI()

    def override_get_session():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session
    app.include_router(router)

    with TestClient(app) as client:
        yield client, engine

    SQLModel.metadata.drop_all(engine)


def test_testing_fixtures_not_mounted_when_testing_mode_disabled(client, monkeypatch):
    monkeypatch.setattr(settings, "enable_test_fixtures", False)

    response = client.post("/testing/fixtures/reset-domain")

    assert response.status_code == 404


def test_ensure_test_fixture_key_configured_requires_key(monkeypatch):
    monkeypatch.setattr(settings, "enable_test_fixtures", True)
    monkeypatch.setattr(settings, "test_fixture_key", None)

    with pytest.raises(RuntimeError, match="TEST_FIXTURE_KEY"):
        ensure_test_fixture_key_configured()


def test_testing_fixture_router_rejects_missing_key(testing_fixture_client):
    client, _engine = testing_fixture_client

    response = client.post("/testing/fixtures/reset-domain")

    assert response.status_code == 403
    assert response.json()["detail"] == "Invalid test fixture key"


def test_testing_fixture_router_rejects_wrong_key(testing_fixture_client):
    client, _engine = testing_fixture_client

    response = client.post(
        "/testing/fixtures/reset-domain",
        headers={"X-Test-Fixture-Key": "wrong-key"},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Invalid test fixture key"


def test_testing_fixture_router_creates_and_resets_domain_data(
    testing_fixture_client,
):
    client, engine = testing_fixture_client
    headers = {"X-Test-Fixture-Key": "fixture-key"}

    programme_response = client.post(
        "/testing/fixtures/programmes",
        headers=headers,
        json={
            "name": "Fixture Programme",
            "start_date": "2025-09-10",
            "end_date": "2026-05-30",
        },
    )
    assert programme_response.status_code == 201
    programme_id = programme_response.json()["id"]

    unit_response = client.post(
        "/testing/fixtures/units",
        headers=headers,
        json={
            "name": "Fixture Unit",
            "description": "Fixture description",
            "unit_code": "COMS99999",
            "colour": "abcdef",
            "programme_id": programme_id,
            "owner": "owner-1",
        },
    )
    assert unit_response.status_code == 201
    unit_id = unit_response.json()["id"]

    coursework_response = client.post(
        "/testing/fixtures/courseworks",
        headers=headers,
        json={
            "name": "Fixture Coursework",
            "description": "Fixture coursework description",
            "unit_id": unit_id,
            "due_date": "2026-04-20T17:00:00",
            "colour": "123abc",
        },
    )
    assert coursework_response.status_code == 201

    students_response = client.post(
        "/testing/fixtures/unit-enrollments/students",
        headers=headers,
        json={
            "unit_id": unit_id,
            "user_ids": ["student-1", "student-2"],
        },
    )
    assert students_response.status_code == 201
    assert students_response.json()["count"] == 2

    duplicate_students_response = client.post(
        "/testing/fixtures/unit-enrollments/students",
        headers=headers,
        json={
            "unit_id": unit_id,
            "user_ids": ["student-1"],
        },
    )
    assert duplicate_students_response.status_code == 409

    lecturers_response = client.post(
        "/testing/fixtures/unit-enrollments/lecturers",
        headers=headers,
        json={
            "unit_id": unit_id,
            "user_ids": ["lecturer-2"],
        },
    )
    assert lecturers_response.status_code == 201
    assert lecturers_response.json()["count"] == 1

    with Session(engine) as session:
        programme = session.exec(select(Programme)).one()
        unit = session.exec(select(Unit)).one()
        coursework = session.exec(select(Coursework)).one()
        enrollments = session.exec(select(UnitEnrollment)).all()

        assert programme.gitlab_id.startswith("test-programme-")
        assert unit.gitlab_id.startswith("test-unit-")
        assert coursework.gitlab_id.startswith("test-coursework-")
        assert len(enrollments) == 4

    reset_response = client.post("/testing/fixtures/reset-domain", headers=headers)
    assert reset_response.status_code == 204

    with Session(engine) as session:
        assert session.exec(select(Programme)).all() == []
        assert session.exec(select(Unit)).all() == []
        assert session.exec(select(Coursework)).all() == []
        assert session.exec(select(UnitEnrollment)).all() == []


def test_testing_fixture_router_rejects_invalid_foreign_keys(
    testing_fixture_client,
):
    client, _engine = testing_fixture_client
    headers = {"X-Test-Fixture-Key": "fixture-key"}

    unit_response = client.post(
        "/testing/fixtures/units",
        headers=headers,
        json={
            "name": "Fixture Unit",
            "description": "Fixture description",
            "unit_code": "COMS99999",
            "colour": "abcdef",
            "programme_id": "c69d5aa2-4c6b-420e-b7e2-b85ba15e8ef0",
            "owner": "owner-1",
        },
    )
    assert unit_response.status_code == 404

    coursework_response = client.post(
        "/testing/fixtures/courseworks",
        headers=headers,
        json={
            "name": "Fixture Coursework",
            "description": "Fixture coursework description",
            "unit_id": "5991fe5e-3b25-4fe7-8f8d-9d5c826a91f9",
            "due_date": "2026-04-20T17:00:00",
            "colour": "123abc",
        },
    )
    assert coursework_response.status_code == 404
