from app.schemas.unit_enrollment import UnitEnrollmentCreate
from uuid import uuid4
from tests.helpers.identities import test_user
import pytest

def test_schema_default_type_is_student():
    payload = UnitEnrollmentCreate(unit_id=uuid4(), user_id=test_user)
    assert (getattr(payload.user_type, "value", payload.user_type) == "student")

def test_schema_invalid_type_raises():
    with pytest.raises(ValueError):
        UnitEnrollmentCreate(unit_id=uuid4(), user_id=test_user, user_type="invalid")

def test_schema_blank_user_id_raises():
    with pytest.raises(ValueError):
        UnitEnrollmentCreate(unit_id=uuid4(), user_id="   ")