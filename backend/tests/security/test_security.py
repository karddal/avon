import pytest
from app.core.security import hash_password, verify_password, get_current_user, PasswordIncorrectError
# from app.models.user import User
from fastapi.security import HTTPAuthorizationCredentials
from unittest.mock import patch, MagicMock
import jwt
from app.core.settings import settings
from starlette.requests import Request

def test_hash_and_verify_password():
    password = "Hashedpassword1234!"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed) == True
    assert verify_password("wrong", hashed) == False

@pytest.mark.asyncio
async def test_create_access_token_and_get_current_user(session):
    fake_token = HTTPAuthorizationCredentials(scheme="Bearer", credentials="fake.jwt.token")

    fake_signing_key = MagicMock()

    with patch("app.core.security.PyJWKClient") as mock_jwks, \
         patch("app.core.security.jwt.decode") as mock_decode:

        mock_jwks.return_value.get_signing_key_from_jwt.return_value = fake_signing_key

        mock_decode.return_value = {
            "sub": "foo@bar",
            "aud": "test-audience",
            "iss": "test-issuer",
        }

        user_id = await get_current_user(fake_token)

        assert user_id == "foo@bar"
