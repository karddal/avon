import pytest
from pydantic import ValidationError
from sqlmodel import SQLModel, Session, create_engine, select
from uuid import uuid4, UUID
from datetime import datetime, timedelta
from contextlib import nullcontext as does_not_raise
from app.models.programme import Programme
from app.models.unit import Unit
from app.schemas.unit import UnitCreate

@pytest.fixture
def programme(session):
    programme = Programme(id=uuid4(), name="Test Programme", start_date=datetime.now(),
                         end_date=datetime.today() + timedelta(days=365))
    session.add(programme)
    session.commit()
    session.refresh(programme)
    return programme

@pytest.mark.parametrize("name,expected", [
    ("", pytest.raises(ValidationError)),
    ("a", does_not_raise()),
    ("a" * 10, does_not_raise()),
    ("b" * 72, does_not_raise()),
    ("a" * 2345, pytest.raises(ValidationError)),
],
                         ids=["empty", "length 1", "length 10", "length 72", "length too high"])
def test_create_unit_with_name(name, expected, programme):
    with expected:
        UnitCreate(name=name, description="test", unit_code="aaaaa", colour="abcdef", programme_id=programme.id)

@pytest.mark.parametrize("description,expected", [
    ("", pytest.raises(ValidationError)),
    ("a", does_not_raise()),
    ("a" * 10, does_not_raise()),
    ("b" * 2000, does_not_raise()),
    ("a" * 2345, pytest.raises(ValidationError)),
],
                         ids=["empty", "length 1", "length 10", "length 2000", "length too high"])
def test_create_unit_with_description(description, expected, programme):
    with expected:
        UnitCreate(name="name", description=description, unit_code="aaaaa", colour="abcdef", programme_id=programme.id)

@pytest.mark.parametrize("code,expected", [
    ("", pytest.raises(ValidationError)),
    ("a", does_not_raise()),
    ("a" * 10, does_not_raise()),
    ("b" * 100, does_not_raise()),
    ("a" * 2345, pytest.raises(ValidationError)),
],
                         ids=["empty", "length 1", "length 10", "length 100", "length too high"])
def test_create_unit_with_code(code, expected, programme):
    with expected:
        UnitCreate(name="name", description="test", unit_code=code, colour="abcdef", programme_id=programme.id)

@pytest.mark.parametrize("colour,expected", [
    ("", pytest.raises(ValidationError)),
    ("a", pytest.raises(ValidationError)),
    ("12cc34", does_not_raise()),
    ("abcdef", does_not_raise()),
    ("#afbadsf" * 100, pytest.raises(ValidationError))
],
                         ids=["empty", "a", "12cc34", "abcdef", "length too high"])
def test_create_unit_with_colour(colour, expected, programme):
    with expected:
        UnitCreate(name="name", description="test", unit_code="abcdef", colour=colour, programme_id=programme.id)