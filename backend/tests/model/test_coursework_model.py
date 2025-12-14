import pytest
from sqlmodel import SQLModel, Session, create_engine, select
from uuid import uuid4, UUID
from datetime import datetime

from app.models.coursework import Coursework
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.models.unit_group_member import UnitGroupMember
from app.models.unit_group import UnitGroup
from app.models.user import User   
# Need teh imports of all the models




# pytest.fixture stuff is done so we have a reusable database setup for testing
@pytest.fixture
def engine():
    # Test via memory so no clean-up afterwards is needed (volatile DB)
    engine = create_engine("sqlite:///:memory:", echo=False) # Echo is false so we don't geta load of SQL logs during testing
    SQLModel.metadata.create_all(engine)
    return engine

@pytest.fixture 
def session(engine):
    with Session(engine) as session:
        yield session #yield not return so to clean up After the tests are done

# Testing that the model auto Populates the id and creation_date fields
def test_coursework_auto_fields(session):
    unit_id = uuid4()
    unit = Unit(id=unit_id,name="Test Unit",description="Test description",unit_code="COMS20017",colour="abcdef")
    session.add(unit)
    session.commit()

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
    unit_id = uuid4()
    unit = Unit(id=unit_id,name="Test Unit",description="Test description",unit_code="COMS20017",colour="abcdef")
    session.add(unit)
    session.commit()

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
    unit_id = uuid4()
    unit = Unit(id=unit_id,name="Test Unit",description="Test description",unit_code="COMS20017",colour="abcdef")
    session.add(unit)
    session.commit()

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
    unit_id = uuid4()
    unit = Unit(id=unit_id,name="Test Unit",description="Test description",unit_code="COMS20017",colour="abcdef")
    session.add(unit)
    session.commit()
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
    unit_id = uuid4()
    unit = Unit(id=unit_id,name="Test Unit",description="Test description",unit_code="COMS20017",colour="abcdef")
    session.add(unit)
    session.commit()

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
    unit_id = uuid4()
    unit = Unit(id=unit_id,name="Test Unit",description="Test description",unit_code="COMS20017",colour="abcdef")
    session.add(unit)
    session.commit()
    
    due = datetime.now()
    cw = Coursework(name="Haskell 2",description="Coursework Description",unit_id=unit_id,due_date=due,colour="abcdef")

    session.add(cw)
    session.commit()
    session.refresh(cw)

    assert isinstance(cw.id, UUID)
    assert isinstance(cw.unit_id, UUID)
    assert isinstance(cw.due_date, datetime)
    assert isinstance(cw.colour, str)
