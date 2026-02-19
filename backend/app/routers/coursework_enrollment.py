from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session
from starlette import status

from app.db.session import get_session

router = APIRouter(prefix="/coursework_enrollment", tags=["coursework"])
session_dependency = Annotated[Session, Depends(get_session)]
