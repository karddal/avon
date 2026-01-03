from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import with_loader_criteria
from sqlalchemy.orm.strategy_options import selectinload
from sqlmodel import Session, select

from app.core.security import get_current_user
from app.db.session import get_session
from app.models.coursework import Coursework
from app.models.programme import Programme
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.unit import UnitAll, UnitAllByGroup

router = APIRouter(prefix="/me", tags=["me"])
session_dependency = Annotated[Session, Depends(get_session)]


@router.get("/units", response_model=UnitAll)
async def me_units(session: session_dependency, me: str = Depends(get_current_user)):
    print("userid: ", me)
    results = session.exec(
        select(Unit).join(UnitEnrollment).where(UnitEnrollment.user_id == me)
    ).all()
    print("results: ")
    print(results)
    return results

@router.get("/units-by-programme", response_model=UnitAllByGroup)
async def me_units_by_programme(session: session_dependency, me: str = Depends(get_current_user)):
    results = session.exec(
        select(Programme)
        .where(
            Programme.units.any(
                Unit.enrollments.any(
                    UnitEnrollment.user_id == me
                )
            )
        ).options(
            selectinload(Programme.units),
            with_loader_criteria(
                Unit,
                Unit.enrollments.any(
                    UnitEnrollment.user_id == me
                )
            )
        )).all()
    return UnitAllByGroup(programmes=results)



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
