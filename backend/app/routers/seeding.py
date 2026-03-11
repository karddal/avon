import os
from pathlib import Path
from typing import Annotated

from dotenv import load_dotenv
from fastapi import APIRouter, Header, HTTPException, status

from app.services.db_reset import reset_database

BACKEND_DIR = Path(__file__).resolve().parents[2]
DEV_ENV_FILE = BACKEND_DIR / ".env.dev"

if os.getenv("ENV") == "dev":
    load_dotenv(DEV_ENV_FILE, override=False)

router = APIRouter(prefix="/seeding", tags=["seeding"])


def reset_route_enabled() -> bool:
    return os.getenv("ENV") == "dev"


def configured_reset_key() -> str:
    return os.getenv("TEST_RESET_KEY", "")


@router.post("/reset-db", include_in_schema=False)
def reset_db(
    x_test_reset_key: Annotated[str | None, Header()] = None,
):
    if not reset_route_enabled():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    reset_key = configured_reset_key()
    if not reset_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Test reset key not configured",
        )

    if x_test_reset_key != reset_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid test reset key",
        )

    return reset_database()
