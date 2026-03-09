import pytest
from app.core.security import hash_password, verify_password, get_current_user_with_role, get_current_user
from fastapi.security import HTTPAuthorizationCredentials
from unittest.mock import patch, MagicMock


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
