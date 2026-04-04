import pytest
from pydantic import ValidationError
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from app.schemas.coursework import CourseworkCreate


# --------- Coursework Name --------------
# Validation Rules: 1 <= length <= 100


def test_empty_name_raises_error():
    now = datetime.now()
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="",
            description="Coursework Description",
            unit_id=uuid4(),
            due_date=now,
            colour="abcdef",
        )


def test_too_long_name_raises_error():
    now = datetime.now()
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="A" * 101,
            description="Coursework Description",
            unit_id=uuid4(),
            due_date=now,
            colour="abcdef",
        )


def test_valid_name_raises_no_error():
    now = datetime.now() + timedelta(minutes=1)
    CourseworkCreate(
        name="Haskell 2",
        description="Coursework Description",
        unit_id=uuid4(),
        due_date=now,
        colour="abcdef",
    )


# -------------- Description -------------
# Validation Rules: 1 <= lenght <= 5000


def test_empty_description_raises_error():
    now = datetime.now()
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="Haskell 2",
            description="",
            unit_id=uuid4(),
            due_date=now,
            colour="abcdef",
        )


def test_too_long_description_raises_error():
    now = datetime.now()
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="Haskell 2",
            description="A" * 5001,
            unit_id=uuid4(),
            due_date=now,
            colour="abcdef",
        )


def test_valid_description_raises_no_error():
    now = datetime.now() + timedelta(minutes=1)
    CourseworkCreate(
        name="Haskell 2",
        description="This is a test description for this unit",
        unit_id=uuid4(),
        due_date=now,
        colour="abcdef",
    )


# -------------- Unit Id -------------


def test_unit_id_not_uuid_raises_error():
    now = datetime.now()
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="Haskell 2",
            description="Coursework Description",
            unit_id="notUUID",
            due_date=now,
            colour="abcdef",
        )


def test_unit_id_valid_uuid_raises_no_error():
    now = datetime.now() + timedelta(minutes=1)
    CourseworkCreate(
        name="Haskell 2",
        description="Coursework Description",
        unit_id=uuid4(),
        due_date=now,
        colour="abcdef",
    )


# -------------- Due Date --------------


def test_empty_due_date_raises_error():
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="Haskell 2",
            description="Coursework Description",
            unit_id=uuid4(),
            colour="abcdef",
        )


def test_not_datetime_due_date_raises_error():
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="Haskell 2",
            description="Coursework Description",
            unit_id=uuid4(),
            due_date="tuctutycty",
            colour="abcdef",
        )


def test_due_date_set_before_now_raises_error():
    one_minute_behind = datetime.now() - timedelta(minutes=1)
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="Haskell 2",
            description="Coursework Description",
            unit_id=uuid4(),
            due_date=one_minute_behind,
            colour="abcdef",
        )


def test_due_date_set_over_a_year_from_now_raises_error():
    overOneYear = datetime.now() + timedelta(days=366)
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="Haskell 2",
            description="Coursework Description",
            unit_id=uuid4(),
            due_date=overOneYear,
            colour="abcdef",
        )


def test_due_date_utc_set_before_now_raises_error():
    one_minute_behind = datetime.now(timezone.utc) - timedelta(minutes=1)
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="Haskell 2",
            description="Coursework Description",
            unit_id=uuid4(),
            due_date=one_minute_behind,
            colour="abcdef",
        )


def test_due_date_utc_set_over_a_year_from_now_raises_error():
    overOneYear = datetime.now() + timedelta(days=366)
    overOneYear = overOneYear.replace(tzinfo=timezone.utc)
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="Haskell 2",
            description="Coursework Description",
            unit_id=uuid4(),
            due_date=overOneYear,
            colour="abcdef",
        )


def test_valid_due_date_raises_no_error():
    validDate = datetime.now() + timedelta(days=34)
    CourseworkCreate(
        name="Haskell 2",
        description="Coursework Description",
        unit_id=uuid4(),
        due_date=validDate,
        colour="abcdef",
    )


def test_valid_due_date_utc_raises_no_error():
    validDate = datetime.now() + timedelta(days=34)
    validDate = validDate.replace(tzinfo=timezone.utc)
    CourseworkCreate(
        name="Haskell 2",
        description="Coursework Description",
        unit_id=uuid4(),
        due_date=validDate,
        colour="abcdef",
    )


# -------------- colour --------------


def test_too_short_colour_raises_error():
    now = datetime.now()
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="Haskell 2",
            description="Coursework Description",
            unit_id=uuid4(),
            due_date=now,
            colour="ab",
        )


def test_wrong_length_colour_raises_error():
    now = datetime.now()
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="Haskell 2",
            description="Coursework Description",
            unit_id=uuid4(),
            due_date=now,
            colour="abcd",
        )
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="Haskell 2",
            description="Coursework Description",
            unit_id=uuid4(),
            due_date=now,
            colour="abcde",
        )


def test_too_long_colour_raises_error():
    now = datetime.now()
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="Haskell 2",
            description="Coursework Description",
            unit_id=uuid4(),
            due_date=now,
            colour="abcdefg",
        )


def test_hashtag_preceding_colour_raises_error():
    now = datetime.now()
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="Haskell 2",
            description="Coursework Description",
            unit_id=uuid4(),
            due_date=now,
            colour="#abcdef",
        )


def test_invalid_characters_in_colour_raises_error():
    now = datetime.now()
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="Haskell 2",
            description="Coursework Description",
            unit_id=uuid4(),
            due_date=now,
            colour="abcd&f",
        )
    with pytest.raises(ValidationError):
        CourseworkCreate(
            name="Haskell 2",
            description="Coursework Description",
            unit_id=uuid4(),
            due_date=now,
            colour="a@cdef",
        )


def test_valid_3_hex_colour_raises_no_error():
    now = datetime.now() + timedelta(minutes=1)
    CourseworkCreate(
        name="Haskell 2",
        description="Coursework Description",
        unit_id=uuid4(),
        due_date=now,
        colour="abc",
    )
    CourseworkCreate(
        name="Haskell 2",
        description="Coursework Description",
        unit_id=uuid4(),
        due_date=now,
        colour="aB6",
    )
    CourseworkCreate(
        name="Haskell 2",
        description="Coursework Description",
        unit_id=uuid4(),
        due_date=now,
        colour="DEF",
    )


def test_valid_6_hex_colour_raises_no_error():
    now = datetime.now() + timedelta(minutes=1)
    CourseworkCreate(
        name="Haskell 2",
        description="Coursework Description",
        unit_id=uuid4(),
        due_date=now,
        colour="abcdef",
    )
    CourseworkCreate(
        name="Haskell 2",
        description="Coursework Description",
        unit_id=uuid4(),
        due_date=now,
        colour="DE67CD",
    )
    CourseworkCreate(
        name="Haskell 2",
        description="Coursework Description",
        unit_id=uuid4(),
        due_date=now,
        colour="A1CeDf",
    )
