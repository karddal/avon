from http import HTTPStatus

from fastapi import APIRouter
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.db.session import SessionDep
from app.models.coursework import Coursework
from app.models.programme import Programme
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.unit import UnitRead, UnitAllByGroup

router = APIRouter(prefix="/check")


@router.get("/health", status_code=200)
async def health_check():
    return {"status", "ok"}
