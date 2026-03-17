from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import Session, select

from app.core.testing import require_test_fixture_access
from app.db.session import get_session
from app.models.coursework import Coursework
from app.models.notification import Notification
from app.models.programme import Programme
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.routers.unit_enrollment import create_owner_enrollment
from app.schemas.coursework import CourseworkCreate, CourseworkRead
from app.schemas.programme import ProgrammeCreate, ProgrammeRead
from app.schemas.unit import UnitCreateOwner, UnitRead
from app.schemas.unit_enrollment import UnitEnrollmentBatchCreate

router = APIRouter(
    prefix="/testing/fixtures",
    tags=["testing-fixtures"],
    dependencies=[Depends(require_test_fixture_access)],
)
session_dependency = Annotated[Session, Depends(get_session)]


def _synthetic_gitlab_id(prefix: str) -> str:
    return f"test-{prefix}-{uuid4()}"


@router.post("/reset-domain", status_code=status.HTTP_204_NO_CONTENT)
async def reset_domain(session: session_dependency):
    for model in (Notification, Coursework, UnitEnrollment, Unit, Programme):
        records = session.exec(select(model)).all()
        for record in records:
            session.delete(record)

    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/programmes",
    response_model=ProgrammeRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_programme_fixture(
    programme: ProgrammeCreate,
    session: session_dependency,
):
    db_programme = Programme(
        name=programme.name,
        start_date=programme.start_date,
        end_date=programme.end_date,
        gitlab_id=_synthetic_gitlab_id("programme"),
    )

    session.add(db_programme)
    session.commit()
    session.refresh(db_programme)
    return db_programme


@router.post("/units", response_model=UnitRead, status_code=status.HTTP_201_CREATED)
async def create_unit_fixture(
    unit: UnitCreateOwner,
    session: session_dependency,
):
    programme = session.get(Programme, unit.programme_id)
    if programme is None:
        raise HTTPException(status_code=404, detail="Programme id is invalid.")

    db_unit = Unit(
        name=unit.name,
        description=unit.description,
        unit_code=unit.unit_code,
        colour=unit.colour,
        programme_id=unit.programme_id,
        gitlab_id=_synthetic_gitlab_id("unit"),
    )

    session.add(db_unit)
    session.flush()
    create_owner_enrollment(db_unit.id, unit.owner, session)
    session.commit()
    session.refresh(db_unit)
    return db_unit


@router.post(
    "/courseworks",
    response_model=CourseworkRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_coursework_fixture(
    coursework: CourseworkCreate,
    session: session_dependency,
):
    unit = session.get(Unit, coursework.unit_id)
    if unit is None:
        raise HTTPException(status_code=404, detail="Corresponding unit not found")

    db_coursework = Coursework(
        name=coursework.name,
        description=coursework.description,
        unit_id=coursework.unit_id,
        due_date=coursework.due_date,
        colour=coursework.colour,
        gitlab_id=_synthetic_gitlab_id("coursework"),
    )

    session.add(db_coursework)
    session.commit()
    session.refresh(db_coursework)
    return db_coursework


def _create_enrollments(
    payload: UnitEnrollmentBatchCreate,
    enrollment_type: str,
    session: Session,
) -> dict[str, int]:
    if session.get(Unit, payload.unit_id) is None:
        raise HTTPException(status_code=404, detail="Unit not found")

    current_user_ids = session.exec(
        select(UnitEnrollment.user_id).where(UnitEnrollment.unit_id == payload.unit_id)
    ).all()
    existing_user_ids = set(payload.user_ids) & set(current_user_ids)

    if existing_user_ids:
        raise HTTPException(status_code=409, detail="Some users are already enrolled!")

    session.add_all(
        [
            UnitEnrollment(
                unit_id=payload.unit_id,
                user_id=user_id,
                type=enrollment_type,
            )
            for user_id in payload.user_ids
        ]
    )
    session.commit()
    return {"count": len(payload.user_ids)}


@router.post("/unit-enrollments/students", status_code=status.HTTP_201_CREATED)
async def create_student_enrollments(
    payload: UnitEnrollmentBatchCreate,
    session: session_dependency,
):
    return _create_enrollments(payload, "student", session)


@router.post("/unit-enrollments/lecturers", status_code=status.HTTP_201_CREATED)
async def create_lecturer_enrollments(
    payload: UnitEnrollmentBatchCreate,
    session: session_dependency,
):
    return _create_enrollments(payload, "lecturer", session)
