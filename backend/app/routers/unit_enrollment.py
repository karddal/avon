from typing import Annotated
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.unit_enrollment import UnitEnrollmentRead, UnitEnrollmentCreate
from app.services.student_enrollment import create

router = APIRouter(prefix="/unit_enrollment", tags=["unit_enrollment"])
session_dependency = Annotated[Session, Depends(get_session)]

@router.post("", response_model=UnitEnrollmentRead, status_code=201)
def enroll_unit(payload: UnitEnrollmentCreate, session: session_dependency):
    return create(session, payload)