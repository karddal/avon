import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine, select
# from app.models.user import User
from app.db.session import get_session
from app.routers import user as user_router
import app.core.security as security

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

# Unit tests will not use this, only integration tetss will
@pytest.fixture
def client(session):
    app = FastAPI()
    app.include_router(user_router.router)
    app.dependency_overrides[get_session] = lambda: session
    return TestClient(app)

