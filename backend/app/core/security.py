import uuid
from datetime import timedelta, datetime, timezone
from fastapi import Request, HTTPException

import jwt
from fastapi.security import OAuth2PasswordBearer
from jwt import InvalidTokenError
from pwdlib import PasswordHash
from pydantic import BaseModel
from sqlmodel import select
from starlette import status

from app.core.settings import settings
from app.db.session import SessionDep
from app.models.user import User

ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

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

def get_user(username: str, session: SessionDep) -> type[User]:
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise UserNotFoundError("User not found")
    return user

def get_user_by_uuid(user_id: uuid.UUID, session: SessionDep) -> type[User]:
    user = session.get(User, user_id)
    print(session.exec(select(User)).all())
    if not user:
        raise UserNotFoundError("User not found")
    return user

def get_user_by_username(email: str, session: SessionDep) -> type[User]:
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise UserNotFoundError("User not found")
    return user

def authenticate_user(username: str, password: str, session: SessionDep) -> type[User]:
    user = get_user_by_username(username, session)
    if not user:
        raise UserNotFoundError("User not found")
    if not verify_password(password, user.hashed_password):
        raise PasswordIncorrectError("Incorrect password")
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes = 30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(request: Request, session: SessionDep):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail = "Could not validate creds",
    )
    print(request.cookies)
    try:
        token = request.cookies.get("access_token")
        print(repr(token), repr(settings.jwt_secret_key))
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM])
        username = payload.get("sub")
        print(username)
        if username is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception
    user = get_user_by_username(email=username, session=session)
    if user is None:
        raise credentials_exception
    return user



