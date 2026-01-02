import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine

from app.main import app
from app.db.session import get_session

_engine = None # Initialising so FastAPI dependancy can safely read it later

# Complicated FastAPI dpeendancy overide bit

# Need to make another session as the previous one is a pytest fixture that fastAPI can't use
def override_get_session():
    with Session(_engine) as session:
        yield session

@pytest.fixture(scope="function")
def client(): # Whenever our router tests request a client, they get this fixture
    global _engine
    _engine = create_engine("sqlite:///:memory:",connect_args={"check_same_thread": False},)

    SQLModel.metadata.create_all(_engine)
    app.dependency_overrides[get_session] = override_get_session # Whenever something requires get_session (from our main app.db.session file), use override_get_session instead
    yield TestClient(app) # creates a TestClient instance using our FastAPI app
    # Clean up after it's finished
    app.dependency_overrides.clear() 
    SQLModel.metadata.drop_all(_engine)
    _engine = None 