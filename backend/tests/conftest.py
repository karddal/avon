import os

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["JWT_SECRET_KEY"] = "testSecretKey"
os.environ["JWT_AUDIENCE"] = "testAudience"
os.environ["JWT_ISSUER"] = "testIssuer"
os.environ["JWKS_URL"] = "http://testserver/jwks"
os.environ["ACCESS_TOKEN_EXPIRY_MINUTES"] = "60"
os.environ["CORS_ORIGIN"] = "http://testserver"
os.environ["IGNORE_AUTH"] = "True"
os.environ["TEST_FIXTURE_KEY"] = "test"
os.environ["ENABLE_TEST_FIXTURES"] = "True"
os.environ["ALLOW_HISTORICAL_SEED_DATA"] = "False"

from app.core.security import get_bearer
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from unittest.mock import patch, AsyncMock

from app.main import app
from app.db.session import get_session


# pytest.fixture stuff is done so we have a reusable database setup for testing
# scope is set to function so that each test function gets a new database
@pytest.fixture(scope="function")
def engine():
    # Test via memory so no clean-up afterwards is needed (volatile DB)
    engine = create_engine(
        "sqlite:///:memory:",
        echo=False,
        connect_args={"check_same_thread": False},
    )  # connect_args Needed for Router tests with FastAPI
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(
        engine
    )  # to clean up after each test file as each one creates a database instance


@pytest.fixture(scope="function")
def session(engine):
    connection = engine.connect()  # connecting to the orgininal engine
    transaction = connection.begin()
    session = Session(
        bind=connection
    )  # bind session to connection so we can control transactions

    yield session  # yield not return so to clean up After the tests are done

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(session):
    def override_get_session():
        yield session  # Use THE SAME session, not a new one

    app.dependency_overrides[get_session] = (
        override_get_session  # Whenever something requires get_session (from our main app.db.session file), use override_get_session instead
    )

    def override_get_bearer():
        yield None

    app.dependency_overrides[get_bearer] = (override_get_bearer)

    with TestClient(
        app
    ) as client:  # creates a TestClient instance using our FastAPI app
        yield client  # yield so that we get a clean shut down and successful clean up

    app.dependency_overrides.clear()  # Clean up after it's finished


@pytest.fixture(scope="function", autouse=True)
def mock_gitlab_coursework():
    success_response = {
        "success": True,
        "gitlabGroupId": 123456,
        "webUrl": "https://gitlab.com/test-group",
        "path": "test-path",
    }

    with patch.multiple(
        "app.routers.programme",
        gl_create_programme=AsyncMock(return_value=success_response),
        gl_update_programme=AsyncMock(return_value=success_response),
        gl_delete_programme=AsyncMock(return_value=success_response),
    ) as programme_mocks, patch.multiple(
        "app.routers.unit",
        gl_create_unit=AsyncMock(return_value=success_response),
        gl_update_unit=AsyncMock(return_value=success_response),
        gl_delete_unit=AsyncMock(return_value=success_response),
    ) as unit_mocks, patch.multiple(
        "app.routers.coursework",
        gl_create_coursework=AsyncMock(return_value=success_response),
        gl_update_coursework=AsyncMock(return_value=success_response),
        gl_delete_coursework=AsyncMock(return_value=success_response),
    ) as coursework_mocks:
        yield {
            "programme": programme_mocks,
            "unit": unit_mocks,
            "coursework": coursework_mocks
        }

@pytest.fixture(scope="function")
def auth_override():
    from app.core.security import get_current_user
    app.dependency_overrides[get_current_user] = lambda: "test-user"
    yield "test-user"
    app.dependency_overrides.pop(get_current_user, None)

@pytest.fixture(scope="function")
def auth_override_with_role():
    from app.core.security import get_current_user_with_role
    from app.schemas.security import CurrentUser

    def _override(user_id: str, role: str = "student"):
        app.dependency_overrides[get_current_user_with_role] = lambda: CurrentUser(user_id=user_id, role=role)

    yield _override

    app.dependency_overrides.pop(get_current_user_with_role, None)
