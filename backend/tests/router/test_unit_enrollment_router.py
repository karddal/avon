from uuid import uuid4

from sqlmodel import Session, select

from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from tests.helpers.factories import create_coursework, create_unit
from tests.helpers.identities import test_user


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
