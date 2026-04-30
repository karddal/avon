from types import SimpleNamespace
from unittest.mock import patch

import jwt
import pytest

from app.core.jwt_utils import token_fingerprint, verify_token_and_get_user
from app.schemas.security import CurrentUser


def test_token_fingerprint_is_stable_and_short():
    assert token_fingerprint("token-value") == token_fingerprint("token-value")
    assert len(token_fingerprint("token-value")) == 8


def test_verify_token_uses_sub_claim_for_user_id():
    signing_key = SimpleNamespace(key="public-key", key_id="kid")

    with patch("app.core.jwt_utils.jwks_provider.get_signing_key", return_value=signing_key), patch(
        "app.core.jwt_utils.jwt.decode",
        return_value={"sub": "user-1", "role": "admin"},
    ):
        user = verify_token_and_get_user("token")

    assert user == CurrentUser(user_id="user-1", role="admin")


def test_verify_token_falls_back_to_id_claim():
    signing_key = SimpleNamespace(key="public-key")

    with patch("app.core.jwt_utils.jwks_provider.get_signing_key", return_value=signing_key), patch(
        "app.core.jwt_utils.jwt.decode",
        return_value={"id": "user-2", "role": "student"},
    ):
        user = verify_token_and_get_user("token")

    assert user == CurrentUser(user_id="user-2", role="student")


def test_verify_token_rejects_payload_without_user_id():
    signing_key = SimpleNamespace(key="public-key")

    with patch("app.core.jwt_utils.jwks_provider.get_signing_key", return_value=signing_key), patch(
        "app.core.jwt_utils.jwt.decode",
        return_value={"role": "student"},
    ):
        with pytest.raises(jwt.PyJWTError, match="missing user_id"):
            verify_token_and_get_user("token")
