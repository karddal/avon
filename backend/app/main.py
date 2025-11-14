from fastapi import FastAPI

from app.db.session import create_db_and_tables, lifespan
from app.routers import user 
from app.routers import coursework
from app.routers import unit
from app.routers import check

app = FastAPI(lifespan=lifespan)
app.include_router(user.router)
app.include_router(unit.router)
app.include_router(check.router)
app.include_router(coursework.router)

create_db_and_tables()

def main():
    print("Hello from backend!")


if __name__ == "__main__":
    main()