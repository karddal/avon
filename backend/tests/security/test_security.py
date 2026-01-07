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

# def test_auth_correct_password(session):
#     password = "Hashedpassword1234!"
#     user = User(
#         first_name="Foo",
#         last_name="Bar",
#         email="foo@bar",
#         hashed_password=hash_password(password),
#         is_lecturer=False,
#     )
#     session.add(user)
#     session.commit()

#     result = authenticate_user(user.email, password, session)
#     assert result.email == user.email

# def test_auth_incorrect_password(session):
#     password = "Hashedpassword1234!"
#     user = User(
#         first_name="Foo",
#         last_name="Bar",
#         email="foo@bar",
#         hashed_password=hash_password(password),
#         is_lecturer=False,
#     )
#     session.add(user)
#     session.commit()

#     with pytest.raises(PasswordIncorrectError):
#         authenticate_user(user.email, "wrong", session)

# def test_create_access_token():
#     token = create_access_token({"sub": "foo@bar"})

#     payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])

#     assert payload["sub"] == "foo@bar"
#     assert "exp" in payload # Can't set it to an exact value as we seem to be using different values for expiry dates all the time, and obvs it changes from when you run the tests
