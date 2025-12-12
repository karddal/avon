import pytest
from sqlmodel import SQLModel, Session, create_engine, select
from uuid import uuid4, UUID
from datetime import datetime, timedelta

from app.models.coursework import Coursework
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.models.unit_group_member import UnitGroupMember
from app.models.unit_group import UnitGroup
from app.models.user import User    




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


