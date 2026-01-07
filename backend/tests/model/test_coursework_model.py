import pytest
from sqlmodel import SQLModel, Session, create_engine, select
from uuid import uuid4, UUID
from datetime import datetime, timedelta

from app.models.coursework import Coursework
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.models.programme import Programme
# Need teh imports of all the models


# Helper Func
def create_unit_with_programme(session) -> UUID:
    programme = Programme(id=uuid4(), name="Test Programme",start_date=datetime.now(), end_date=datetime.today() + timedelta(days=365))
    session.add(programme)
    session.commit()
    unit_id = uuid4()
    unit = Unit(id=unit_id, name="Test Unit", description="Test description", unit_code="COMS20017", colour="abcdef", programme_id=programme.id,)
    session.add(unit)
    session.commit()

    return unit_id

# Testing that the model auto Populates the id and creation_date fields
def test_coursework_auto_fields(session):
    unit_id = create_unit_with_programme(session)

    due = datetime.now()
    cw = Coursework(name="Haskell 2",description="Coursework Description",unit_id=unit_id,due_date=due,colour="abcdef")
    
    session.add(cw)
    session.commit()
    session.refresh(cw)
    
    assert isinstance(cw.id, UUID)
    assert cw.creation_date is not None
    assert isinstance(cw.creation_date, datetime)

# Ensuring the data is availlable still
def test_coursework_persists_properly(session):
    unit_id = create_unit_with_programme(session)

    due = datetime.now()
    cw = Coursework(name="Haskell 2", description="Coursework Description", unit_id=unit_id, due_date=due, colour="abcdef")

    session.add(cw)
    session.commit()
    session.refresh(cw)
    retrieved = session.get(Coursework, cw.id)

    assert retrieved.name == "Haskell 2"
    assert retrieved.description == "Coursework Description"
    assert retrieved.unit_id == unit_id
    assert retrieved.due_date == due
    assert retrieved.colour == "abcdef"

# Testing that we can succseesfully query by unit_id
def test_coursework_query_by_unit_id(session):
    unit_id = create_unit_with_programme(session)

    due = datetime.now()
    cw = Coursework(name="Haskell 2",description="Coursework Description",unit_id=unit_id,due_date=due,colour="abcdef")

    session.add(cw)
    session.commit()
    stmt = select(Coursework).where(Coursework.unit_id == unit_id)
    result = session.exec(stmt).first()

    assert result is not None
    assert result.unit_id == unit_id

# Testing we can update model correctly
def test_coursework_update(session):
    unit_id = create_unit_with_programme(session)

    due = datetime.now()
    cw = Coursework(name="Haskell 2",description="Coursework Description",unit_id=unit_id,due_date=due,colour="abcdef")

    session.add(cw)
    session.commit()
    session.refresh(cw)
    cw.name = "Haskell 3"
    cw.description = "Coursework Description 3"
    session.add(cw)
    session.commit()
    session.refresh(cw)

    assert cw.name == "Haskell 3"
    assert cw.description == "Coursework Description 3"

# Testing we can successfuly delete a coursework
def test_coursework_delete(session):
    unit_id = create_unit_with_programme(session)

    due = datetime.now()
    cw = Coursework(name="Haskell 2",description="Coursework Description",unit_id=unit_id,due_date=due,colour="abcdef")

    session.add(cw)
    session.commit()
    session.refresh(cw)

    session.delete(cw)
    session.commit()

    assert session.get(Coursework, cw.id) is None

# Make sure field types are correct
def test_coursework_field_types(session):
    unit_id = create_unit_with_programme(session)
    
    due = datetime.now()
    cw = Coursework(name="Haskell 2",description="Coursework Description",unit_id=unit_id,due_date=due,colour="abcdef")

    session.add(cw)
    session.commit()
    session.refresh(cw)

    assert isinstance(cw.id, UUID)
    assert isinstance(cw.unit_id, UUID)
    assert isinstance(cw.due_date, datetime)
    assert isinstance(cw.colour, str)
