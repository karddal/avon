import uuid

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine, select

from app.models.user import User
from app.db.session import get_session
from app.routers import user as users_router

# Test database
TEST_DATABASE_URL = "sqlite:///./test_users.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})


def get_session_override():
    #use a test database session instead of the real one.
    with Session(engine) as session:
        yield session


@pytest.fixture(scope="session", autouse=True)
def create_db_and_tables():
    #Create all tables before running tests and drop them after the test session.
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(autouse=True)
def clear_users_table():
    #Clear all records from the User table before each test to ensure isolation.
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        for u in users:
            session.delete(u)
        session.commit()


@pytest.fixture(scope="session")
def app():
    """Build a temporary FastAPI app with the users router and test DB dependency."""
    app = FastAPI()
    app.include_router(users_router.router)

    # Override the get_session dependency to use the test database
    app.dependency_overrides[get_session] = get_session_override
    return app


@pytest.fixture(scope="session")
def client(app: FastAPI):
    """Provide a FastAPI TestClient for sending HTTP requests."""
    return TestClient(app)


@pytest.fixture(autouse=True)
def patch_password_functions(monkeypatch):
    """
    Override hash_password and verify_password during tests
    so password behavior is predictable and doesn't rely on real hashing.
    """
    def fake_hash_password(password: str) -> str:
        return f"hashed-{password}"

    def fake_verify_password(plain: str, hashed: str) -> bool:
        return hashed == f"hashed-{plain}"

    monkeypatch.setattr(users_router, "hash_password", fake_hash_password)
    monkeypatch.setattr(users_router, "verify_password", fake_verify_password)


# -------------------- /users/create --------------------

def test_create_user_success(client: TestClient):
    payload = {
        "first_name": "Alice",
        "last_name": "Chen",
        "email": "alice@example.com",
        "password": "StrongPass1!",
        "password_repeat": "StrongPass1!",
        "is_lecturer": False,
    }

    response = client.post("/users/create", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["email"] == payload["email"]
    assert data["first_name"] == payload["first_name"]
    assert data["last_name"] == payload["last_name"]
    assert data["is_lecturer"] is False
    # UserRead normally does not return hashed_password, so we don’t check it here


def test_create_user_email_already_registered(client: TestClient):
    payload = {
        "first_name": "Bob",
        "last_name": "Lee",
        "email": "bob@example.com",
        "password": "StrongPass1!",
        "password_repeat": "StrongPass1!",
        "is_lecturer": True,
    }

    # First creation should succeed
    r1 = client.post("/users/create", json=payload)
    assert r1.status_code == 201

    # Second creation with the same email should fail
    r2 = client.post("/users/create", json=payload)
    assert r2.status_code == 400
    assert r2.json()["detail"] == "Email already registered"


# -------------------- /users/{user_id} GET --------------------

def test_get_details_success(client: TestClient):
    # Create a new user
    create_payload = {
        "first_name": "Carol",
        "last_name": "Wu",
        "email": "carol@example.com",
        "password": "StrongPass1!",
        "password_repeat": "StrongPass1!",
        "is_lecturer": False,
    }
    create_resp = client.post("/users/create", json=create_payload)
    assert create_resp.status_code == 201
    user_id = create_resp.json()["id"]

    # Fetch user details
    resp = client.get(f"/users/{user_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == user_id
    assert data["email"] == "carol@example.com"


def test_get_details_not_found(client: TestClient):
    random_id = str(uuid.uuid4())
    resp = client.get(f"/users/{random_id}")
    assert resp.status_code == 404
    assert resp.json()["detail"] == "User not found"


# -------------------- /users/{user_id} DELETE --------------------

def test_delete_user_success(client: TestClient):
    # Create a user
    create_payload = {
        "first_name": "David",
        "last_name": "Zhang",
        "email": "david@example.com",
        "password": "StrongPass1!",
        "password_repeat": "StrongPass1!",
        "is_lecturer": True,
    }
    create_resp = client.post("/users/create", json=create_payload)
    assert create_resp.status_code == 201
    user_id = create_resp.json()["id"]

    # Delete the user
    delete_resp = client.delete(f"/users/{user_id}")
    assert delete_resp.status_code in (200, 204)

    # Verify the user no longer exists
    get_resp = client.get(f"/users/{user_id}")
    assert get_resp.status_code == 404


def test_delete_user_not_found(client: TestClient):
    random_id = str(uuid.uuid4())
    resp = client.delete(f"/users/{random_id}")
    assert resp.status_code == 404
    assert resp.json()["detail"] == "User not found"


# -------------------- /users/login --------------------

def test_login_success(client: TestClient):
    # Because of fake hash/verify, password will be stored as "hashed-{password}"
    create_payload = {
        "first_name": "Eve",
        "last_name": "Lin",
        "email": "eve@example.com",
        "password": "StrongPass1!",
        "password_repeat": "StrongPass1!",
        "is_lecturer": False,
    }
    create_resp = client.post("/users/create", json=create_payload)
    assert create_resp.status_code == 201

    login_payload = {
        "email": "eve@example.com",
        "password": "StrongPass1!",
    }
    login_resp = client.post("/users/login", json=login_payload)
    assert login_resp.status_code == 200
    data = login_resp.json()
    assert data["email"] == "eve@example.com"


def test_login_wrong_password(client: TestClient):
    create_payload = {
        "first_name": "Frank",
        "last_name": "Hu",
        "email": "frank@example.com",
        "password": "StrongPass1!",
        "password_repeat": "StrongPass1!",
        "is_lecturer": False,
    }
    create_resp = client.post("/users/create", json=create_payload)
    assert create_resp.status_code == 201

    # only fail at authentication step
    login_payload = {
        "email": "frank@example.com",
        "password": "WeakPass1!",  # wrong password
    }
    login_resp = client.post("/users/login", json=login_payload)
    assert login_resp.status_code == 400
    assert login_resp.json()["detail"] == "Incorrect email or password"


def test_login_unknown_email(client: TestClient):
    login_payload = {
        "email": "nobody@example.com",
        "password": "StrongPass1!",
    }
    login_resp = client.post("/users/login", json=login_payload)
    assert login_resp.status_code == 400
    assert login_resp.json()["detail"] == "Incorrect email or password"
