import hashlib
import logging
import jwt
from jwt import PyJWKClient
from app.core.settings import settings
from app.schemas.security import CurrentUser

logger = logging.getLogger("jwt_util")

def token_fingerprint(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()[:8]

class JwksProvider:
    def __init__(self, jwks_url: str):
        self._jwks_url = jwks_url
        self._client = PyJWKClient(jwks_url)

    def get_signing_key(self, token: str):
        return self._client.get_signing_key_from_jwt(token)

jwks_provider = JwksProvider(settings.jwks_url)

def verify_token_and_get_user(token_str: str) -> CurrentUser:
    fingerprint = token_fingerprint(token_str)

    logger.debug("JWT token fingerprint=%s", fingerprint)

    signing_key = jwks_provider.get_signing_key(token_str)
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
    role = payload.get("role")

    if not user_id:
        logger.warning("JWT missing user_id fingerprint=%s payload_keys=%s", fingerprint, list(payload.keys()))
        raise jwt.PyJWTError("missing user_id")

    logger.debug("JWT verify success fingerprint=%s user_id=%s role=%s", fingerprint, user_id, role)
    return CurrentUser(user_id=user_id, role=role)
