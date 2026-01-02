# Test database
#these don't actually work for me currently, created new testing files to fix this.

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine, select

from app.core.security import create_access_token, get_current_user, authenticate_user, PasswordIncorrectError
from app.models.user import User
from app.db.session import get_session
from app.routers import user as users_router

TEST_DATABASE_URL = "sqlite:///./test_users.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})


def get_session_override():
    #use a test database session instead of the real one.
    with Session(engine) as session:
        return session


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

@pytest.mark.asyncio
async def test_create_access_token(client: TestClient):
    sess = get_session_override()
    user = User(
                first_name="Dempsey",
                last_name="Jack",
                email="jwd@university.ac.uk",
                hashed_password="$argon2id$v=19$m=65536,t=3,p=4$YmEXd8OiqssP687E6GPWuQ$oPUtLJ8fr+4OTANWYlOl0UsmNeAcE6kRaNpoHSElYAY",
                is_lecturer=False
            )
    sess.add(user)
    sess.commit()
    token = create_access_token({"sub": "jwd@university.ac.uk"})
    assert await get_current_user(token, sess) == user

@pytest.mark.asyncio
async def test_auth_correct_password(client: TestClient):
    sess = get_session_override()
    user = User(
        first_name="Dempsey",
        last_name="Jack",
        email="jwd@university.ac.uk",
        hashed_password="$argon2id$v=19$m=65536,t=3,p=4$YmEXd8OiqssP687E6GPWuQ$oPUtLJ8fr+4OTANWYlOl0UsmNeAcE6kRaNpoHSElYAY",
        is_lecturer=False
    )
    sess.add(user)
    sess.commit()
    authenticate_user(user.email, "Hashedpassword1234!", sess)

@pytest.mark.asyncio
async def test_auth_incorrect_password(client: TestClient):
    sess = get_session_override()
    user = User(
        first_name="Dempsey",
        last_name="Jack",
        email="jwd@university.ac.uk",
        hashed_password="$argon2id$v=19$m=65536,t=3,p=4$YmEXd8OiqssP687E6GPWuQ$oPUtLJ8fr+4OTANWYlOl0UsmNeAcE6kRaNpoHSElYAY",
        is_lecturer=False
    )
    sess.add(user)
    sess.commit()
    with pytest.raises(PasswordIncorrectError):
        authenticate_user(user.email, "afadsf!", sess)


# import pytest
# from app.core.security import create_access_token, get_current_user, authenticate_user, hash_password, PasswordIncorrectError
# from app.models.user import User
# from fastapi import Request, HTTPException
# import pytest
# from starlette.requests import Request

# from app.core.security import create_access_token, get_current_user
# from app.models.user import User


# @pytest.mark.asyncio
# async def test_create_access_token(session):
#     user = User(
#         first_name="Dempsey",
#         last_name="Jack",
#         email="jwd@university.ac.uk",
#         hashed_password="irrelevant",
#         is_lecturer=False,
#     )
#     session.add(user)
#     session.commit()

#     token = create_access_token({"sub": user.email})

#     request = Request(
#         {
#             "type": "http",
#             "headers": [
#                 (b"cookie", f"access_token={token}".encode()),
#             ],
#         }
#     )

#     result = await get_current_user(request, session)
#     assert result.email == user.email




# @pytest.mark.asyncio
# async def test_auth_correct_password(session):
#     user = User(
#         first_name="Dempsey",
#         last_name="Jack",
#         email="jwd@university.ac.uk",
#         hashed_password="hashed-Hashedpassword1234!",
#         is_lecturer=False
#     )
#     session.add(user)
#     session.commit()
#     authenticate_user(user.email, "Hashedpassword1234!", session)

# @pytest.mark.asyncio
# async def test_auth_incorrect_password(session):
#     user = User(
#         first_name="Dempsey",
#         last_name="Jack",
#         email="jwd@university.ac.uk",
#         hashed_password="$argon2id$v=19$m=65536,t=3,p=4$YmEXd8OiqssP687E6GPWuQ$oPUtLJ8fr+4OTANWYlOl0UsmNeAcE6kRaNpoHSElYAY",
#         is_lecturer=False
#     )
#     session.add(user)
#     session.commit()
#     with pytest.raises(PasswordIncorrectError):
#         authenticate_user(user.email, "afadsf!", session)


