import pytest
from pydantic import ValidationError
from datetime import date, timedelta
from uuid import uuid4

from app.schemas.unit import ProgrammeWithUnits, UnitWithoutProgramme
from app.schemas.programme import ProgrammeCreate, ProgrammeRead, ProgrammeUpdate, ProgrammeDelete

# ------------------ ID ------------------

def test_programme_id_not_uuid_raises_error():
    start = date.today() + timedelta(days=1)
    end = start + timedelta(days=365)
    with pytest.raises(ValidationError):
        ProgrammeRead(id="notUUID", name="Year 2026/2027", start_date=start, end_date=end, units=[])


def test_programme_id_valid_uuid_raises_no_error():
    programme_id = uuid4()
    start = date.today() + timedelta(days=1)
    end = start + timedelta(days=365)
    ProgrammeRead(id=programme_id, name="Year 2026/2027", start_date=start, end_date=end, units=[])

# --------------` Name ----------------

def test_programme_name_not_string_raises_error():
    start = date.today() + timedelta(days=1)
    end = start + timedelta(days=365)
    with pytest.raises(ValidationError):
        ProgrammeCreate(name=75667568, start_date=start, end_date=end)

def test_programme_name_valid_string_raises_no_error():
    start = date.today() + timedelta(days=1)
    end = start + timedelta(days=365)
    ProgrammeCreate(name="Year 2026/2027", start_date=start, end_date=end)

def test_programme_name_too_long_raises_error():
    start = date.today() + timedelta(days=1)
    end = start + timedelta(days=365)
    with pytest.raises(ValidationError):
        ProgrammeCreate(name="A"*101, start_date=start, end_date=end)

def test_programme_name_empty_string_raises_error():
    start = date.today() + timedelta(days=1)
    end = start + timedelta(days=365)
    with pytest.raises(ValidationError):
        ProgrammeCreate(name=None, start_date=start, end_date=end)

# -------------- Start Date ----------------

def test_programme_start_date_not_date_raises_error():
    end = date.today() + timedelta(days=365)
    with pytest.raises(ValidationError):
        ProgrammeCreate(name="Year 2026/2027", start_date="notdate", end_date=end)

def test_programme_start_date_valid_date_raises_no_error():
    start = date.today() + timedelta(days=1)
    end = start + timedelta(days=365)
    ProgrammeCreate(name="Year 2026/2027", start_date=start, end_date=end)

def test_programme_start_date_empty():
    end = date.today() + timedelta(days=365)
    with pytest.raises(ValidationError):
        ProgrammeCreate(name="Year 2026/2027", start_date=None, end_date=end)
# Start date can be in past, just not end date as per current validation rules, and beacuse it gives the admin a bit more leaniency if they forget to create the programme before it starts

# -------------- End Date ----------------

def test_programme_end_date_not_date_raises_error():
    start = date.today() + timedelta(days=1)
    with pytest.raises(ValidationError):
        ProgrammeCreate(name="Year 2026/2027", start_date=start, end_date="notdate")

def test_programme_end_date_valid_date_raises_no_error():
    start = date.today() + timedelta(days=1)
    end = start + timedelta(days=365)
    ProgrammeCreate(name="Year 2026/2027", start_date=start, end_date=end)

def test_programme_end_date_empty():
    start = date.today() + timedelta(days=1)
    with pytest.raises(ValidationError):
        ProgrammeCreate(name="Year 2026/2027", start_date=start, end_date=None)

def test_programme_end_date_in_past_raises_error():
    past_date = date.today() - timedelta(days=10)
    with pytest.raises(ValidationError):
        ProgrammeCreate(name="Year 2026/2027", start_date=date.today(), end_date=past_date)

# -------------- Unit List stuff ----------------
def test_programme_units_not_list_raises_error():
    programme_id = uuid4()
    start = date.today()
    end = start + timedelta(days=365)
    with pytest.raises(ValidationError):
        ProgrammeRead(id=programme_id, name="Year 2026/2027", start_date=start, end_date=end, units="notalist")

def test_units_invalid_item_raises_error():
    programme_id = uuid4()
    start = date.today()
    end = start + timedelta(days=365)
    with pytest.raises(ValidationError):
        ProgrammeRead(id=programme_id, name="Year 2026/2027", start_date=start, end_date=end, units=[45857847])

def test_units_valid_list_raises_no_error():
    creation_date=date.today()
    unit = UnitWithoutProgramme(id=uuid4(), name="Imp and Func", description="2nd best first year unit", creation_date=creation_date, unit_code="COMS10016", colour="abcdef", unlocked=True)

    programme_id = uuid4()
    start = date.today()
    end = start + timedelta(days=365)
    ProgrammeWithUnits(id=programme_id, name="Year 2026/2027", start_date=start, end_date=end, units=[unit])

