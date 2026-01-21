import pytest
from pydantic.v1 import ValidationError
from sqlmodel import SQLModel, Session, create_engine, select
from uuid import uuid4, UUID
from datetime import datetime, timedelta

from app.models.programme import Programme
from app.models.unit import Unit

def create_programme(session) -> UUID:
    programme = Programme(id=uuid4(), name="Test Programme", start_date=datetime.now(),
                          end_date=datetime.today() + timedelta(days=365))
    session.add(programme)
    session.commit()
    return programme.id

# Ensure that the unit autopopulates id, creation_date
def test_unit_autopopulate_works(session):
    # create a test programme for our purposes
    pid = create_programme(session)

    my_unit = Unit(
        name="My Unit",
        description="Test description",
        unit_code="ABCDEF",
        colour="ffffff",
        programme_id=pid,
    )
    session.add(my_unit)
    session.commit()
    session.refresh(my_unit)

    # check that the field were populated
    assert isinstance(my_unit.id, UUID)
    assert isinstance(my_unit.creation_date, datetime)
    assert my_unit.creation_date is not None
    assert my_unit.id is not None

# ensure that saving a unit works and we can get back the stuff later
def test_unit_saving(session):
    pid = create_programme(session)
    my_unit = Unit(
        name="My Unit",
        description="Test description",
        unit_code="ABCDEF",
        colour="ffffff",
        programme_id=pid,
    )
    session.add(my_unit)
    session.commit()
    session.refresh(my_unit)

    retrieved = session.get(Unit, my_unit.id)
    assert retrieved.name == "My Unit"
    assert retrieved.description == "Test description"
    assert retrieved.programme_id == pid