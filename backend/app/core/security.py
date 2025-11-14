import uuid
from datetime import timedelta, datetime, timezone
from http.client import HTTPException
from typing import Annotated

import jwt
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jwt import InvalidTokenError
from passlib.context import CryptContext
from pwdlib import PasswordHash
from pydantic import BaseModel
from sqlmodel import select
from starlette import status

from app.core.settings import Settings, settings
from app.db.session import SessionDep
from app.models.user import User

ALGORITHM = "HS256"
oath2_scheme = OAuth2PasswordBearer(tokenUrl="token")

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
    user_id: uuid.UUID | None = None

class UserNotFoundError(Exception):
    def __init__(self, message: str):
        self.message = message

class PasswordIncorrectError(Exception):
    def __init__(self, message: str):
        self.message = message

def get_user(username: str, password: str, session: SessionDep) -> type[User]:
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise UserNotFoundError("User not found")
    if not verify_password(user.hashed_password, password):
        raise PasswordIncorrectError("Incorrect password")
    return user

def get_user_by_uuid(user_id: uuid.UUID, password: str, session: SessionDep) -> type[User]:
    user = session.get(User, user_id)
    if not user:
        raise UserNotFoundError("User not found")
    if not verify_password(user.hashed_password, password):
        raise PasswordIncorrectError("Incorrect password")
    return user

def authenticate_user(username: str, password: str, session: SessionDep) -> bool | type[User]:
    user = get_user(username, password, session)
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

async def get_current_user(token: Annotated[str, Depends(oath2_scheme)], session: SessionDep):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail = "Could not validate creds",
        headers = {"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username = username)
    except InvalidTokenError:
        raise credentials_exception
    user = get_user_by_uuid(user_id=token_data.user_id, session=session)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return current_user



