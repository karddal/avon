from sqlmodel import Session, select
from app.schemas.unit_enrollment import UnitEnrollmentCreate
from uuid import uuid4
from tests.helpers.identities import test_user
import pytest
from fastapi import HTTPException
from app.services.student_enrollment import create
from tests.helpers.factories import create_unit
from app.models.unit_enrollment import UnitEnrollment

def test_service_unit_not_found_404(session: Session):
    payload = UnitEnrollmentCreate(unit_id=uuid4(), user_id=test_user)

    with pytest.raises(HTTPException) as enrollment:
        create(session, payload)

    assert enrollment.value.status_code == 404
    assert enrollment.value.detail == "Unit not found"

def test_service_create_success(session: Session):
    unit_id = create_unit(session)

    payload = UnitEnrollmentCreate(unit_id=unit_id, user_id=test_user, user_type="lecturer")
    enrollment = create(session, payload)

    assert enrollment.unit_id == unit_id
    assert enrollment.user_id == test_user
    assert getattr(enrollment.user_type, "value", enrollment.user_type) == "lecturer"

def test_service_duplicate_409(session: Session):
    unit_id = create_unit(session)
    payload = UnitEnrollmentCreate(unit_id=unit_id, user_id=test_user)

    create(session, payload)

    with pytest.raises(HTTPException) as enrollment:
        create(session, payload)

    assert enrollment.value.status_code == 409
    assert enrollment.value.detail == "User already enrolled in this unit"

    rows = session.exec(select(UnitEnrollment)).all()
    assert len(rows) == 1

def test_service_maps_lecturer_correctly(session: Session):
    unit_id = create_unit(session)

    payload = UnitEnrollmentCreate(
        unit_id=unit_id,
        user_id=test_user,
        user_type="lecturer",
    )

    enrollment = create(session, payload)

    assert getattr(enrollment.user_type, "value", enrollment.user_type) == "lecturer"

def test_service_rejects_invalid_user_type_even_if_schema_breaks(session: Session):
    unit_id = create_unit(session)

    payload = UnitEnrollmentCreate.model_construct(
        unit_id=unit_id,
        user_id=test_user,
        user_type="invalid",
    )

    with pytest.raises(Exception):
        create(session, payload)