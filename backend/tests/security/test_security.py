import pytest
from app.core.security import hash_password, verify_password, create_access_token, authenticate_user, get_current_user, PasswordIncorrectError
# from app.models.user import User
import jwt
from app.core.settings import settings
from starlette.requests import Request

def test_hash_and_verify_password():
    password = "Hashedpassword1234!"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed) == True
    assert verify_password("wrong", hashed) == False

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

# @pytest.mark.asyncio
# async def test_create_access_token_and_get_current_user(session):
#     user = User(
#         first_name="Foo",
#         last_name="Bar",
#         email="foo@bar",
#         hashed_password="HashedPassword1234!",
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
