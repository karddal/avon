
from typing import Annotated

from fastapi import HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials

from fastapi.security.http import HTTPBearer
from pwdlib import PasswordHash
from pydantic import BaseModel
from starlette import status
import jwt
from jwt import PyJWKClient

from app.core.settings import settings

ALGORITHM = "HS256"

password_hash = PasswordHash.recommended()
def hash_password(password: str) -> str:
    #password -> hash
    return password_hash.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    #verify weather the password is correct
    return password_hash.verify(plain_password, hashed_password)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: str | None = None

class UserNotFoundError(Exception):
    def __init__(self, message: str):
        self.message = message

class PasswordIncorrectError(Exception):
    def __init__(self, message: str):
        self.message = message

get_bearer = HTTPBearer(auto_error=True)

async def get_current_user(token: Annotated[HTTPAuthorizationCredentials, Depends(get_bearer)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if settings.ignore_auth: return "aaaa"
    try:
        print("Token here: ")
        print(token)
        print(settings.jwt_audience)
        jwks_client = PyJWKClient(settings.jwks_url)
        signing_key = jwks_client.get_signing_key_from_jwt(token.credentials)
        payload = jwt.decode(
            token.credentials,
            signing_key,
            audience=settings.jwt_audience,
            issuer=settings.jwt_issuer,
            algorithms=["EdDSA"]
        )
        user_id = payload.get("sub")
        print(user_id)
        if user_id is None:
            raise credentials_exception
    except jwt.exceptions.InvalidTokenError as e:
        print("Invalid token")
        print(e)
        raise credentials_exception
    if user_id is None:
        raise credentials_exception
    return user_id
#
# async def get_current_user(request: Request, session: SessionDep):
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail = "Could not validate creds",
#     )
#     try:
#         token = request.cookies.get("access_token")
#         print(repr(token), repr(settings.jwt_secret_key))
#         payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM])
#         username = payload.get("sub")
#         print(username)
#         if username is None:
#             raise credentials_exception
#     except InvalidTokenError:
#         raise credentials_exception
#     user = get_user_by_username(email=username, session=session)
#     if user is None:
#         raise credentials_exception
#     return user
