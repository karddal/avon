from ipaddress import ip_address

from fastapi import APIRouter, HTTPException, Request, status

from app.core.env import is_development_app_env, is_test_app_env, load_backend_env
from app.services.db_reset import reset_app_data, reset_database

load_backend_env()

router = APIRouter(prefix="/seeding", tags=["seeding"])


def reset_route_enabled() -> bool:
    return is_development_app_env() or is_test_app_env()


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
