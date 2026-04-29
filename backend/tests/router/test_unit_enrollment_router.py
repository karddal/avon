from uuid import uuid4

from fastapi.security import HTTPAuthorizationCredentials
from unittest.mock import patch
from sqlmodel import Session, select

from app.core.settings import settings
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.security import CurrentUser
from tests.helpers.factories import create_coursework, create_unit
from tests.helpers.identities import test_user, test_user2


def test_router_create_success(client, session: Session):
    unit_id = create_unit(session).id
    create_coursework(session, unit_id)

    response = client.post(
        "/unit_enrollment",
        json={
            "unit_id": str(unit_id),
            "user_id": test_user,
            "type": "student",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["unit_id"] == str(unit_id)
    assert body["user_id"] == test_user
    assert body["type"] == "student"

    db_enrollment = session.get(UnitEnrollment, (unit_id, test_user))
    assert db_enrollment is not None
    assert str(db_enrollment.unit_id) == str(unit_id)
    assert db_enrollment.user_id == test_user
    assert db_enrollment.type == "student"

    # check to make sure that the student has been added to any ongoing courseworks

    db_unit = session.get(Unit, unit_id)
    if not db_unit:
        raise Exception("Cannot happen")


def test_router_invalid_type_422(client, session: Session):
    unit_id = create_unit(session).id

    response = client.post(
        "/unit_enrollment",
        json={
            "unit_id": str(unit_id),
            "user_id": test_user,
            "type": "123",
        },
    )

    assert response.status_code == 422


def test_router_blank_user_id_422(client, session: Session):
    unit_id = create_unit(session).id

    response = client.post(
        "/unit_enrollment",
        json={
            "unit_id": str(unit_id),
            "user_id": "    ",
            "type": "student",
        },
    )

    assert response.status_code == 422


def test_router_unit_not_found_404(client, session: Session):
    response = client.post(
        "/unit_enrollment",
        json={
            "unit_id": str(uuid4()),
            "user_id": test_user,
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Unit not found"


def test_router_duplicate_409(client, session: Session):
    unit_id = create_unit(session).id

    payload = {
        "unit_id": str(unit_id),
        "user_id": test_user,
        "type": "student",
    }

    response1 = client.post("/unit_enrollment", json=payload)
    assert response1.status_code == 201

    response2 = client.post("/unit_enrollment", json=payload)
    assert response2.status_code == 409
    assert response2.json()["detail"] == "User already enrolled in this unit"

    db_enrollment = session.exec(
        select(UnitEnrollment).where(
            UnitEnrollment.unit_id == unit_id,
            UnitEnrollment.user_id == test_user,
        )
    ).all()
    assert len(db_enrollment) == 1


def test_transfer_owner_allows_admin(client, session: Session):
    unit_id = create_unit(session).id
    previous_owner = "owner-user"
    new_owner = test_user2

    session.add(UnitEnrollment(unit_id=unit_id, user_id=previous_owner, type="owner"))
    session.add(UnitEnrollment(unit_id=unit_id, user_id=new_owner, type="lecturer"))
    session.commit()

    response = client.put(
        f"/unit_enrollment/{unit_id}/transfer_owner",
        json={"user_id": new_owner},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["message"] == "Ownership transferred successfully"
    assert body["previous_owner"] == previous_owner
    assert body["new_owner"] == new_owner

    old_owner_enrollment = session.get(UnitEnrollment, (unit_id, previous_owner))
    new_owner_enrollment = session.get(UnitEnrollment, (unit_id, new_owner))
    assert old_owner_enrollment is not None
    assert old_owner_enrollment.type == "lecturer"
    assert new_owner_enrollment is not None
    assert new_owner_enrollment.type == "owner"


def test_transfer_owner_rejects_non_owner_without_enroll_scope(client, session: Session):
    previous_ignore_auth = settings.ignore_auth
    settings.ignore_auth = False

    try:
        unit_id = create_unit(session).id
        previous_owner = "owner-user"
        requesting_user = "lecturer-user"
        new_owner = test_user2

        session.add(UnitEnrollment(unit_id=unit_id, user_id=previous_owner, type="owner"))
        session.add(UnitEnrollment(unit_id=unit_id, user_id=requesting_user, type="lecturer"))
        session.add(UnitEnrollment(unit_id=unit_id, user_id=new_owner, type="lecturer"))
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
            return_value=CurrentUser(user_id=requesting_user, role="lecturer"),
        ):
            response = client.put(
                f"/unit_enrollment/{unit_id}/transfer_owner",
                json={"user_id": new_owner},
            )

        assert response.status_code == 401
        assert "Missing scopes" in response.json()["detail"]

        current_owner = session.get(UnitEnrollment, (unit_id, previous_owner))
        target_owner = session.get(UnitEnrollment, (unit_id, new_owner))
        assert current_owner is not None
        assert current_owner.type == "owner"
        assert target_owner is not None
        assert target_owner.type == "lecturer"
    finally:
        settings.ignore_auth = previous_ignore_auth
        from app.core.security import get_bearer
        from app.main import app

        app.dependency_overrides.pop(get_bearer, None)


def test_batch_enroll_students_rejects_lecturer_without_enroll_scope(client, session: Session):
    previous_ignore_auth = settings.ignore_auth
    settings.ignore_auth = False

    try:
        unit_id = create_unit(session).id
        requesting_user = "lecturer-user"
        session.add(UnitEnrollment(unit_id=unit_id, user_id=requesting_user, type="lecturer"))
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
            return_value=CurrentUser(user_id=requesting_user, role="lecturer"),
        ):
            response = client.post(
                "/unit_enrollment/batch",
                json={"unit_id": str(unit_id), "user_ids": [test_user]},
            )

        assert response.status_code == 401
        assert "Missing scopes" in response.json()["detail"]
        assert session.get(UnitEnrollment, (unit_id, test_user)) is None
    finally:
        settings.ignore_auth = previous_ignore_auth
        from app.core.security import get_bearer
        from app.main import app

        app.dependency_overrides.pop(get_bearer, None)
