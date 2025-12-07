import pytest
from pydantic import ValidationError
from datetime import datetime, timedelta
from uuid import uuid4

from app.schemas.coursework import CourseworkCreate


# --------- Coursework Name --------------
# Validation Rules: 1 <= length <= 100

def test_empty_name_raises_error():
    now = datetime.now()
    with pytest.raises(ValueError):
        CourseworkCreate(name="", description="Coursework Description", unit_id=uuid4(), due_date=now, colour="abcdef")

def test_too_long_name_raises_error():
    now = datetime.now()
    with pytest.raises(ValueError):
        CourseworkCreate(name="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", description="Coursework Description", unit_id=uuid4(), due_date=now, colour="abcdef")

# -------------- Description -------------
# Validation Rules: 1 <= lenght <= 5000
# Can maybe increase this if we need to? Don't know if teh 5000 limt is suitable, but we do need a limit either way.

def test_empty_description_raises_error():
    now = datetime.now()
    with pytest.raises(ValueError):
        CourseworkCreate(name="Haskell 2", description="", unit_id=uuid4(), due_date=now, colour="abcdef")

# -------------- Unit Id -------------
# Validation Rules: must be of type UUID

def test_unit_id_not_uuid_raises_error():
    now = datetime.now()
    with pytest.raises(ValueError):
        CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id="notUUID", due_date=now, colour="abcdef")


# -------------- Due Date --------------
# Validation Rules: must have a due date, must be in the future, must be within one year from now

def test_empty_due_date_raises_error():
    with pytest.raises(ValueError):
        CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), colour="abcdef")

# Ensuring that check for due date being of type datetime works
def test_not_datetime_due_date_raises_error():
    with pytest.raises(ValidationError):
        CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date="tuctutycty", colour="abcdef")

def test_due_date_set_before_now_raises_error():
    one_minute_behind = datetime.now() - timedelta(minutes=1)
    with pytest.raises(ValueError):
        CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=one_minute_behind, colour="abcdef")

def test_due_date_set_over_a_year_from_now_raises_error():
    overOneYear = datetime.now() + timedelta(days=366)
    with pytest.raises(ValueError):
        CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=overOneYear, colour="abcdef")

# Check that the tests on the due dates works for both .utc and not .utc datetimes
def test_due_date_utc_set_before_now_raises_error():
    one_minute_behind = datetime.now() - timedelta(minutes=1)
    one_minute_behind = one_minute_behind.replace(tzinfo=datetime.timezone.utc)
    with pytest.raises(ValueError):
        CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=one_minute_behind, colour="abcdef")

def test_due_date_utc_set_over_a_year_from_now_raises_error():
    overOneYear = datetime.now() + timedelta(days=366)
    overOneYear = overOneYear.replace(tzinfo=datetime.timezone.utc)
    with pytest.raises(ValueError):
        CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=overOneYear, colour="abcdef")


# -------------- colour --------------
# Validation Rules:
def test_too_short_colour_raises_error():
    now = datetime.now()
    with pytest.raises(ValidationError):
        CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=now, colour="ab")

def test_wrong_length_colour_raises_error():
    now = datetime.now()
    with pytest.raises(ValidationError):
        CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=now, colour="abcd")
        CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=now, colour="abcde")

def test_too_long_colour_raises_error():
    now = datetime.now()
    with pytest.raises(ValidationError):
        CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=now, colour="abcdefg")

def test_hashtag_preceding_colour_raises_error():
    now = datetime.now()
    with pytest.raises(ValidationError):
        CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=now, colour="#abcdef")

def test_invalid_characters_in_colour_raises_error():
    now = datetime.now()
    with pytest.raises(ValidationError):
        CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=now, colour="abcdef")
        CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=now, colour="abcd&f")
        CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=now, colour="a@cdef")

def test_valid_3_hex_colour():
    now = datetime.now()
    CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=now, colour="abc")
    CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=now, colour="aB6")
    CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=now, colour="DEF")


def test_valid_6_hex_colour():
    now = datetime.now()
    CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=now, colour="abcdef")
    CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=now, colour="DE67CD")
    CourseworkCreate(name="Haskell 2", description="Coursework Description", unit_id=uuid4(), due_date=now, colour="A1CeDf")
