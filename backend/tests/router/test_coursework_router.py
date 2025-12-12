import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from uuid import uuid4
from datetime import datetime, timedelta

from app.main import app
from app.db.session import get_session
from app.models.unit import Unit
from app.models.coursework import Coursework
from app.models.unit_enrollment import UnitEnrollment
from app.models.unit_group_member import UnitGroupMember
from app.models.unit_group import UnitGroup
from app.models.user import User    

# Using the same testing setups as from the coursework model tests, just obviously with the client stuff to etst the actual functionality

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

@pytest.fixture
def client(session):
    def override_get_session():
        yield session

    app.dependency_overrides[get_session] = override_get_session
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()



