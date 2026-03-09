import os
from contextlib import asynccontextmanager
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.pool import NullPool


if os.getenv("ENV") == "dev":
    env_file = ".env.dev"
    load_dotenv(dotenv_path=env_file)

db_url = os.getenv("DATABASE_URL")
if not db_url:
    raise RuntimeError("No database url found")

is_e2e = os.getenv("CI_MODE") in ("1", "true", "True") or os.getenv("ENV") == "e2e"

engine_kwargs = {}

# For db testing
# Currently only work in sqlite need to fix when use other database
if db_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

    if is_e2e:
        engine_kwargs["poolclass"] = NullPool

engine = create_engine(db_url, **engine_kwargs)


# Create session dependency so that you use only one session per request
def get_session():
    with Session(engine) as session:
        yield session


# Create the tables
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    print("[BACKEND] Database created")


SessionDep = Annotated[Session, Depends(get_session)]


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield
