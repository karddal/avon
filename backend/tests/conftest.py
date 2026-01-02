import pytest
from sqlmodel import SQLModel, Session, create_engine
from fastapi.testclient import TestClient

# from app.main import app
# from app.db.session import get_session  # or get_db
from app.models.coursework import Coursework
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.models.unit_group_member import UnitGroupMember
from app.models.unit_group import UnitGroup
from app.models.user import User
# Need teh imports of all the models

# pytest.fixture stuff is done so we have a reusable database setup for testing
# scope is set to function so that each test function gets a new database
@pytest.fixture(scope="function")
def engine():
    # Test via memory so no clean-up afterwards is needed (volatile DB)
    engine = create_engine("sqlite:///:memory:", echo=False, connect_args={"check_same_thread": False},) # connect_args Needed for Router tests with FastAPI
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine) # to clean up after each test file as each one creates a database instance


@pytest.fixture(scope="function")
def session(engine):
    with Session(engine) as session:
        yield session # yield not return so to clean up After the tests are done

