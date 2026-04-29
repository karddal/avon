import logging
from typing import Annotated

from fastapi import HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials

from fastapi.security.http import HTTPBearer
from pwdlib import PasswordHash
from pydantic import BaseModel
from starlette import status
import jwt
from app.core.jwt_utils import _token_fingerprint, verify_token_and_get_user
from app.schemas.security import CurrentUser

from app.core.settings import settings

ALGORITHM = "HS256"

logger = logging.getLogger("security")

password_hash = PasswordHash.recommended()
http_bearer = HTTPBearer(auto_error=True)


def hash_password(password: str) -> str:
    # password -> hash
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # verify weather the password is correct
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

async def get_bearer(
    token: Annotated[HTTPAuthorizationCredentials, Depends(http_bearer)],
):
    return token

def credentials_exception():
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

async def get_current_user_with_role(token: Annotated[HTTPAuthorizationCredentials, Depends(get_bearer)]) -> CurrentUser:
    fingerprint = _token_fingerprint(token.credentials)
    try:
        return verify_token_and_get_user(token.credentials)

    except jwt.ExpiredSignatureError:
        logger.warning("JWT expired fp=%s", fingerprint)
        raise credentials_exception()

    except jwt.InvalidAudienceError:
        logger.warning(
            "JWT invalid audience fingerprint=%s expected=%s", fingerprint, settings.jwt_audience)
        raise credentials_exception()

    except jwt.InvalidIssuerError:
        logger.warning(
            "JWT invalid issuer fingerprint=%s expected=%s", fingerprint, settings.jwt_issuer)
        raise credentials_exception()

    except jwt.PyJWTError as e:
        logger.warning("JWT invalid fingerprint=%s error=%s", fingerprint, repr(e))
        raise credentials_exception()

    except Exception as e:
        logger.exception("JWT verify unexpected error fingerprint=%s error=%s", fingerprint, repr(e))
        raise credentials_exception()

async def get_current_user(user: Annotated[CurrentUser, Depends(get_current_user_with_role)]) -> str:
    return user.user_id

