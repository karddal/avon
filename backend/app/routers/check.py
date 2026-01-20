from fastapi import APIRouter
from sqlmodel import select
from app.db.session import SessionDep
from app.models.unit import Unit
from app.models.coursework import Coursework
from app.models.unit_enrollment import UnitEnrollment

router = APIRouter(prefix="/check")

# @router.get("/users")
# async def get_users(session: SessionDep):
#     statement = select(User)
#     users = session.exec(statement).all()
#     return {"users": [user.model_dump() for user in users]}

@router.get("/units")
async def get_units(session: SessionDep):
    statement = select(Unit)
    units = session.exec(statement).all()
    return {"units": [unit.model_dump() for unit in units]}

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

@router.get("/debug/counts")
async def get_counts(session: SessionDep):
    from sqlmodel import func
    
    units = session.exec(select(func.count(Unit.id))).one()
    coursework = session.exec(select(func.count(Coursework.id))).one()
    enrollments = session.exec(select(func.count(UnitEnrollment.unit_id))).one()
    
    return {
        "units": units,
        "coursework": coursework,
        "enrollments": enrollments,
    }