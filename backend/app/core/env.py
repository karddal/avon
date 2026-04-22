import os
from functools import lru_cache
from pathlib import Path
from typing import Literal
from typing import cast

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[2]
DEFAULT_ENV_FILE = BACKEND_DIR / ".env"
DEV_ENV_FILE = BACKEND_DIR / ".env.dev"
TEST_ENV_FILE = BACKEND_DIR / ".env.test"

AppEnv = Literal["development", "test", "production"]

_APP_ENV_ALIASES = {
    "dev": "development",
    "development": "development",
    "test": "test",
    "e2e": "test",
    "prod": "production",
    "production": "production",
}


def normalize_app_env(value: str | None) -> AppEnv:
    if value is None:
        return "production"

    normalized = _APP_ENV_ALIASES.get(value.lower())
    if normalized is None:
        raise ValueError(
            f"Unsupported APP_ENV '{value}'. Expected one of: dev, development, test, e2e, prod, production."
        )

    return cast(AppEnv, normalized)


def _get_explicit_app_env() -> str | None:
    return os.getenv("APP_ENV") or os.getenv("ENV")


def get_app_env() -> AppEnv:
    explicit_app_env = _get_explicit_app_env()
    if explicit_app_env is not None:
        return normalize_app_env(explicit_app_env)

    if DEV_ENV_FILE.exists():
        return "development"

    return "production"


def is_test_app_env() -> bool:
    return get_app_env() == "test"


def is_development_app_env() -> bool:
    return get_app_env() == "development"


def get_database_url() -> str | None:
    load_backend_env()
    return os.getenv("DATABASE_URL")


@lru_cache(maxsize=1)
def load_backend_env() -> None:
    app_env = get_app_env()

    if app_env == "development":
        load_dotenv(DEV_ENV_FILE, override=False)
        load_dotenv(DEFAULT_ENV_FILE, override=False)
        return

    if app_env == "test":
        load_dotenv(TEST_ENV_FILE, override=False)
        load_dotenv(DEFAULT_ENV_FILE, override=False)
        return

    load_dotenv(DEFAULT_ENV_FILE, override=False)
