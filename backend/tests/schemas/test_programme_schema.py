import pytest
from pydantic import ValidationError
from datetime import date, timedelta
from uuid import uuid4

from app.schemas.unit import ProgrammeWithUnits, UnitWithoutProgramme

# ------------------ ID ------------------

def test_programme_id_not_uuid_raises_error():
    start = date.today()
    end = start + timedelta(days=365)
    with pytest.raises(ValidationError):
        ProgrammeWithUnits(id="notUUID", name="Year 2026/2027", start_date=start, end_date=end, units=[])


def test_programme_id_valid_uuid_raises_no_error():
    programme_id = uuid4()
    start = date.today()
    end = start + timedelta(days=365)
    ProgrammeWithUnits(id=programme_id, name="Year 2026/2027", start_date=start, end_date=end, units=[])

# --------------` Name ----------------

def test_programme_name_not_string_raises_error():
    programme_id = uuid4()
    start = date.today()
    end = start + timedelta(days=365)
    ProgrammeWithUnits(id=programme_id, name=75667568, start_date=start, end_date=end, units=[])

def test_programme_name_valid_string_raises_no_error():
    programme_id = uuid4()
    start = date.today()
    end = start + timedelta(days=365)
    ProgrammeWithUnits(id=programme_id, name="Year 2026/2027", start_date=start, end_date=end, units=[])