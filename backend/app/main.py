import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.settings import settings
from app.core.testing import ensure_test_fixture_key_configured
from app.db.session import create_db_and_tables, lifespan
from app.models.coursework import Coursework
from app.models.unit import UnitWithCourseworks
from app.routers import (
    base_image,
    check,
    coursework,
    me,
    notification,
    programme,
    project,
    structure,
    unit,
    unit_enrollment,
)
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
from dotenv import load_dotenv
import os
if os.getenv("ENV") == "dev":
    env_file = ".env.dev"
    load_dotenv(dotenv_path=env_file)

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
)

app = FastAPI(lifespan=lifespan)

origins = os.getenv("CORS_ORIGIN")

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
app.include_router(base_image.router)
Coursework.model_rebuild()
UnitWithCourseworks.model_rebuild()

app.include_router(unit_enrollment.router)

if settings.enable_test_fixtures:
if settings.testing_mode:
    from app.routers import testing_fixtures

    ensure_test_fixture_key_configured()
    app.include_router(testing_fixtures.router)

create_db_and_tables()


def main():
    print("[BACKEND] Hello from backend!")


if __name__ == "__main__":
    main()
