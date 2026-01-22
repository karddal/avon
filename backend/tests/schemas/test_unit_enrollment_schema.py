from app.schemas.unit_enrollment import UnitEnrollmentCreate
from uuid import uuid4
from tests.helpers.identities import test_user
import pytest

def test_schema_default_type_is_student():
    payload = UnitEnrollmentCreate(unit_id=uuid4(), user_id=test_user)
    assert payload.user_type == "student"

def test_schema_invalid_type_raises():
    with pytest.raises(ValueError):
        UnitEnrollmentCreate(unit_id=uuid4(), user_id=test_user, user_type="invalid")

def test_schema_blank_user_id_raises():
    with pytest.raises(ValueError):
        UnitEnrollmentCreate(unit_id=uuid4(), user_id="   ")

def test_schema_none_user_id_raises():
    with pytest.raises(Exception):
        UnitEnrollmentCreate(unit_id=uuid4(), user_id=None)

def test_schema_blank_unit_id_raises():
    with pytest.raises(ValueError):
        UnitEnrollmentCreate(unit_id="  ", user_id=test_user)

def test_schema_invalid_unit_id_string_raises():
    with pytest.raises(Exception):
        UnitEnrollmentCreate(unit_id="a-b-c", user_id=test_user)

def test_schema_none_unit_id_raises():
    with pytest.raises(Exception):
        UnitEnrollmentCreate(unit_id=None, user_id=test_user)