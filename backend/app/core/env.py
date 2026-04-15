import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[2]
DEFAULT_ENV_FILE = BACKEND_DIR / ".env"
DEV_ENV_FILE = BACKEND_DIR / ".env.dev"


@lru_cache(maxsize=1)
def load_backend_env() -> None:
    # In dev, prefer .env.dev values while still allowing .env to fill gaps.
    if os.getenv("ENV") == "dev":
        load_dotenv(DEV_ENV_FILE, override=False)
        load_dotenv(DEFAULT_ENV_FILE, override=False)
        return

    load_dotenv(DEFAULT_ENV_FILE, override=False)
