import os
from ipaddress import ip_address
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request, status

from app.core.settings import settings
from app.services.db_reset import reset_app_data, reset_database

BACKEND_DIR = Path(__file__).resolve().parents[2]
DEV_ENV_FILE = BACKEND_DIR / ".env.dev"

if os.getenv("ENV") == "dev":
    load_dotenv(DEV_ENV_FILE, override=False)

router = APIRouter(prefix="/seeding", tags=["seeding"])


def reset_route_enabled() -> bool:
    return os.getenv("ENV") == "dev" or settings.enable_test_fixtures


def request_is_local(request: Request) -> bool:
    client = request.client
    if client is None:
        return False

    host = client.host

    if host == "localhost":
        return True

    if host.startswith("::ffff:"):
        host = host.removeprefix("::ffff:")

    host = host.split("%", 1)[0]

    try:
        return ip_address(host).is_loopback
    except ValueError:
        return False


@router.post("/reset-db", include_in_schema=False)
def reset_db(request: Request):
    if not reset_route_enabled() or not request_is_local(request):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    return reset_database()


@router.post("/reset-app-data", include_in_schema=False)
def reset_app_seed_data(request: Request):
    if not reset_route_enabled() or not request_is_local(request):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    return reset_app_data()
