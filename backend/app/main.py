from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import create_db_and_tables, lifespan
from app.routers import user 
from app.routers import coursework
from app.routers import unit
from app.routers import check, me
from app.routers import auth

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:3000",
    "https://avon.ac"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(unit.router)
app.include_router(check.router)
app.include_router(coursework.router)
app.include_router(me.router)
app.include_router(auth.router)

create_db_and_tables()

def main():
    print("Hello from backend!")


if __name__ == "__main__":
    main()