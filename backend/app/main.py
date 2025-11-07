from fastapi import FastAPI

from app.db.session import create_db_and_tables
from app.routers import user

app = FastAPI()
app.include_router(user.router)

create_db_and_tables()

def main():
    print("Hello from backend!")


if __name__ == "__main__":
    main()