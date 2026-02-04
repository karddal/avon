
from typing import Annotated

from fastapi import HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials

from fastapi.security.http import HTTPBearer
from pwdlib import PasswordHash
from pydantic import BaseModel
from starlette import status
import jwt
from jwt import PyJWKClient
import logging
import hashlib

from app.core.settings import settings

logger = logging.getLogger("auth")

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

jwks_client = PyJWKClient(settings.jwks_url)

def _token_fingerprint(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()[:8]

def credentials_exception():
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

def verify_token_and_get_user_id(token_str: str) -> str:
    fingerprint = _token_fingerprint(token_str)

    try:
        logger.debug("JWT token fingerprint is %s", fingerprint)

        signing_key = jwks_client.get_signing_key_from_jwt(token_str)
        keyId = getattr(signing_key, "key_id", None)
        logger.debug("JWT key selected fingerprint=%s key_id=%s", fingerprint, keyId)

        payload = jwt.decode(
            token_str,
            signing_key.key if hasattr(signing_key, "key") else signing_key,
            audience=settings.jwt_audience,
            issuer=settings.jwt_issuer,
            algorithms=["EdDSA"]
        )

        user_id = payload.get("sub") or payload.get("id")

        if not user_id:
            logger.warning("JWT missing user_id fingerprint=%s payload_keys=%s", fingerprint, list(payload.keys()))
            raise credentials_exception()

        logger.info("JWT verify success fingerprint=%s user_id=%s",fingerprint, user_id)
        return user_id

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

async def get_current_user(token: Annotated[HTTPAuthorizationCredentials, Depends(get_bearer)]):
    logger.debug("HTTP auth attempt scheme=%s", token.scheme)
    return verify_token_and_get_user_id(token.credentials)

# async def get_current_user(token: Annotated[HTTPAuthorizationCredentials, Depends(get_bearer)]):
#     try:
#         print("Token here: ")
#         print(token)
#         print(settings.jwt_audience)
#
#         signing_key = jwks_client.get_signing_key_from_jwt(token.credentials)
#         payload = jwt.decode(
#             token.credentials,
#             signing_key,
#             audience=settings.jwt_audience,
#             issuer=settings.jwt_issuer,
#             algorithms=["EdDSA"]
#         )
#         print("JWT payload:", payload)
#         user_id = payload.get("sub")
#         print(user_id)
#         if user_id is None:
#             raise credentials_exception
#     except jwt.exceptions.InvalidTokenError as e:
#         print("Invalid token")
#         print(e)
#         raise credentials_exception
#     if user_id is None:
#         raise credentials_exception
#     return user_id


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
