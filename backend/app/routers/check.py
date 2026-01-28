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


@router.get("/units", response_model=UnitRead)
async def get_units(session: SessionDep):
    statement = select(Unit)
    units = session.exec(statement).all()
    response = []
    for unit in units:
        start = unit.start_date
        end = unit.end_date
        if start is None:
            start = unit.programme.start_date
            end = unit.programme.end_date
        responseUnit = UnitRead(unit)
        responseUnit.start_date = start
        responseUnit.end_date = end
        response.append(responseUnit)
    return {"units": response}

@router.get("/units-by-programme", response_model=UnitAllByGroup)
async def get_units_by_programme(session: SessionDep):
    results = session.exec(
        select(Programme).options(selectinload(Programme.units))
    ).all()
    return UnitAllByGroup(programmes=results)

@router.get("/coursework")
async def get_coursework(session: SessionDep):
    statement = select(Coursework)
    coursework = session.exec(statement).all()
    return {"coursework": [cw.model_dump() for cw in coursework]}


@router.get("/enrollments")
async def get_enrollments(session: SessionDep):
    statement = select(UnitEnrollment)
    enrollments = session.exec(statement).all()
    return {"enrollments": [enrollment.model_dump() for enrollment in enrollments]}


@router.get("/programmes")
async def get_programmes(session: SessionDep):
    statement = select(Programme)
    programmes = session.exec(statement).all()
    return {"programmes": [programme.model_dump() for programme in programmes]}

@router.get("/programmes/members")
async def get_programmes_members(session: SessionDep):
    statement = select(Programme)
    programmes = session.exec(statement).all()
    return {"programmes": [{"data": programme.model_dump(), "members": programme.units }for programme in programmes]}

@router.get("/debug/counts")
async def get_counts(session: SessionDep):
    from sqlmodel import func

    units = session.exec(select(func.count(Unit.id))).one()
    coursework = session.exec(select(func.count(Coursework.id))).one()
    enrollments = session.exec(select(func.count(UnitEnrollment.unit_id))).one()
    groups = session.exec(select(func.count(Programme.id))).one()

    return {
        "units": units,
        "coursework": coursework,
        "enrollments": enrollments,
        "groups": groups,
    }
