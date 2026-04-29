import pytest
from app.core.scopes.scopes import (
    ResourceInformation,
    ResourceType,
    Scopes,
    authenticate_user,
    resolve_unit_scopes,
)
from app.core.security import hash_password, verify_password, get_current_user_with_role, get_current_user
from fastapi.security import HTTPAuthorizationCredentials
from unittest.mock import patch, MagicMock
from tests.helpers.factories import create_unit
from app.models.unit_enrollment import UnitEnrollment
from app.models.unit import Unit
from app.schemas.security import CurrentUser


def test_hash_and_verify_password():
    password = "Hashedpassword1234!"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrong", hashed)


@pytest.mark.asyncio
async def test_create_access_token_and_get_current_user(session):
    fake_token = HTTPAuthorizationCredentials(
        scheme="Bearer", credentials="fake.jwt.token"
    )

    fake_signing_key = MagicMock()
    fake_signing_key.key = "fake-public-key"
    fake_signing_key.key_id = "kid-fake"

    with patch("app.core.jwt_utils.jwks_provider.get_signing_key", return_value=fake_signing_key), \
         patch("app.core.security.jwt.decode") as mock_decode:

        mock_decode.return_value = {
            "sub": "foo@bar",
            "aud": "test-audience",
            "iss": "test-issuer",
        }

        current_user = await get_current_user_with_role(fake_token)
        user_id = await get_current_user(current_user)

        assert user_id == "foo@bar"


@pytest.mark.asyncio
async def test_owner_enrollment_gets_lecturer_scopes(session):
    unit = create_unit(session)
    owner_user_id = "owner-user"
    session.add(UnitEnrollment(unit_id=unit.id, user_id=owner_user_id, type="owner"))
    session.commit()

    scopes = await resolve_unit_scopes(owner_user_id, unit.id, session)

    assert Scopes.UNIT_READ in scopes
    assert Scopes.UNIT_COURSEWORK_MANAGE in scopes
    assert Scopes.UNIT_COURSEWORK_GITLAB in scopes


@pytest.mark.asyncio
async def test_authenticate_user_resolves_scopes_from_id_claim(session):
    unit = create_unit(session)
    unit.unlocked = True
    session.add(unit)
    session.commit()
    user_id = "user-from-id-claim"
    session.add(UnitEnrollment(unit_id=unit.id, user_id=user_id, type="student"))
    session.commit()

    fake_token = HTTPAuthorizationCredentials(
        scheme="Bearer", credentials="fake.jwt.token"
    )

    with patch(
        "app.core.scopes.scopes.verify_token_and_get_user",
        return_value=CurrentUser(
            user_id=user_id,
            role="user",
        ),
    ):
        authenticated = await authenticate_user(
            ResourceInformation(ResourceType.UNIT, unit.id),
            fake_token,
            session,
        )

    assert Scopes.UNIT_READ in authenticated.scopes


@pytest.mark.asyncio
async def test_authenticate_user_resolves_scopes_when_resource_information_uses_model_class(session):
    unit = create_unit(session)
    unit.unlocked = True
    session.add(unit)
    session.commit()
    user_id = "user-from-model-class"
    session.add(UnitEnrollment(unit_id=unit.id, user_id=user_id, type="student"))
    session.commit()

    fake_token = HTTPAuthorizationCredentials(
        scheme="Bearer", credentials="fake.jwt.token"
    )

    with patch(
        "app.core.scopes.scopes.verify_token_and_get_user",
        return_value=CurrentUser(user_id=user_id, role="user"),
    ):
        authenticated = await authenticate_user(
            ResourceInformation(Unit, unit.id),
            fake_token,
            session,
        )

    assert Scopes.UNIT_READ in authenticated.scopes


@pytest.mark.asyncio
async def test_locked_unit_student_enrollment_gets_no_read_scope(session):
    unit = create_unit(session)
    unit.unlocked = False
    user_id = "locked-student"
    session.add(unit)
    session.add(UnitEnrollment(unit_id=unit.id, user_id=user_id, type="student"))
    session.commit()

    scopes = await resolve_unit_scopes(user_id, unit.id, session)

    assert Scopes.UNIT_READ not in scopes
