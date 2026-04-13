import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import lifespan
from app.models.coursework import Coursework
from app.models.unit import UnitWithCourseworks
from app.routers import coursework, structure
from app.routers import project
from app.routers import notification
from app.routers import unit
from app.routers import check, me
from app.routers import programme
from app.routers import unit_enrollment
from app.core.settings import settings
from app.core.testing import ensure_test_fixture_key_configured
from app.routers import seeding

if os.getenv("ENV") == "dev":
    env_file = ".env.dev"
    load_dotenv(dotenv_path=env_file)


def _get_cors_origins() -> list[str]:
    raw_origins = os.getenv("CORS_ORIGIN")
    if not raw_origins:
        return []

    try:
        parsed = json.loads(raw_origins)
    except json.JSONDecodeError:
        return [raw_origins]

    if isinstance(parsed, list):
        return [str(origin) for origin in parsed]

    return [str(parsed)]


app = FastAPI(lifespan=lifespan)

origins = _get_cors_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(unit.router)
app.include_router(check.router)
app.include_router(coursework.router)
app.include_router(me.router)
app.include_router(programme.router)
app.include_router(structure.router)
app.include_router(project.router)
app.include_router(notification.router)
app.include_router(seeding.router)
Coursework.model_rebuild()
UnitWithCourseworks.model_rebuild()

app.include_router(unit_enrollment.router)

if settings.enable_test_fixtures:
    from app.routers import testing_fixtures

    ensure_test_fixture_key_configured()
    app.include_router(testing_fixtures.router)


def main():
    print("[BACKEND] Hello from backend!")


if __name__ == "__main__":
    main()
