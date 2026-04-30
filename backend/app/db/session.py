import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.pool import NullPool

from app.core.env import get_database_url, is_test_app_env, load_backend_env
from app.sqs_worker import sqs_worker
# from app.provision_worker import run_provision_worker

logger = logging.getLogger("app.db.session")

load_backend_env()

db_url = get_database_url()
if not db_url:
    raise RuntimeError("No database url found")

is_e2e = is_test_app_env()

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
    logger.info("Database created")


SessionDep = Annotated[Session, Depends(get_session)]

# from app.provision_worker import run_provision_worker

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Lifespan started")
    from app.core.settings import settings
    from app.provision_worker import run_provision_worker

    create_db_and_tables()
    app.state.task_group = asyncio.TaskGroup()
    await app.state.task_group.__aenter__()

    if settings.run_background_worker and not settings.testing_mode: 

        worker_engine = create_engine(db_url, **engine_kwargs)
        worker_session = Session(worker_engine)
        app.state.task_group.create_task(
            sqs_worker(worker_session, settings.aws_results_queue_url)
        )

    if not settings.testing_mode:
        app.state.task_group.create_task(run_provision_worker())


    yield
