import os
from contextlib import asynccontextmanager
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from sqlmodel import Session, SQLModel, create_engine


if os.getenv("ENV") == "dev":
    env_file = ".env.dev"
    load_dotenv(dotenv_path=env_file)

db_url = os.getenv("DATABASE_URL")
if not db_url:
    raise RuntimeError("No database url found")
engine = create_engine(db_url)


# Create session dependency so that you use only one session per request
def get_session():
    with Session(engine) as session:
        yield session


# Create the tables
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    print("Database created")

SessionDep = Annotated[Session, Depends(get_session)]


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    print("yo yo")
    print("beep beep")
    yield
