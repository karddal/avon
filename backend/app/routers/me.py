from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.security import get_current_user
from app.db.session import get_session
from app.models.coursework import Coursework
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment

router = APIRouter(prefix="/me", tags=["me"])
session_dependency = Annotated[Session, Depends(get_session)]


@router.get("/units")
async def me_units(session: session_dependency, me: str = Depends(get_current_user)):
    print("userid: ", me)
    results = session.exec(
        select(Unit).join(UnitEnrollment).where(UnitEnrollment.user_id == me)
    ).all()
    print("results: ")
    print(results)
    return results


@router.get("/courseworks")
async def me_courseworks(
    session: session_dependency, me: str = Depends(get_current_user)
):
    courseworks = []
    units = session.exec(
        select(Unit).join(UnitEnrollment).where(UnitEnrollment.user_id == me)
    ).all()
    for unit in units:
        courseworks.extend(
            session.exec(select(Coursework).where(Coursework.unit_id == unit.id))
        )
    return courseworks
