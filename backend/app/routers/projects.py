
from typing import Annotated
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session

router = APIRouter(prefix="/projects", tags=["projects"])
session_dependency = Annotated[Session, Depends(get_session)]

@router.get("/health")
async def health_check():
    return {"health-check": "alive"}


