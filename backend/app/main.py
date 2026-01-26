from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import create_db_and_tables, lifespan
from app.models.coursework import Coursework
from app.models.unit import UnitWithCourseworks
from app.routers import coursework
from app.routers import unit
from app.routers import check, me
from app.routers import programme
from app.routers import unit_enrollment
from dotenv import load_dotenv
import os

if os.getenv("ENV") == "dev":
    env_file = ".env.dev"
    load_dotenv(dotenv_path=env_file)

app = FastAPI(lifespan=lifespan)

origins = os.getenv("CORS_ORIGIN")

print("CORS origins:", origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins="http://localhost:3000",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(unit.router)
app.include_router(check.router)
app.include_router(coursework.router)
app.include_router(me.router)
app.include_router(programme.router)
Coursework.model_rebuild()
UnitWithCourseworks.model_rebuild()

app.include_router(unit_enrollment.router)

create_db_and_tables()

def main():
    print("Hello from backend!")


if __name__ == "__main__":
    main()