from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.coursework import Coursework
from app.models.programme import Programme
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.unit import (
    CourseworkAll,
    CourseworkRead,
    StandaloneUnitCreate,
    UnitAll,
    UnitCreate,
    UnitRead,
    UnitUpdate,
)

router = APIRouter(prefix="/units", tags=["units"])
session_dependency = Annotated[Session, Depends(get_session)]


@router.post(
    "/create/standalone",
    response_model=StandaloneUnitCreate,
    status_code=status.HTTP_201_CREATED,
)
async def create_standalone_unit(unit: UnitCreate, session: session_dependency):
    if unit.type == "programme":
        db_unit = Unit(
            name=unit.name,
            description=unit.description,
            unit_code=unit.unit_code,
            colour=unit.colour,
            start_date=None,
            end_date=None,
            programme=unit.programme,
        )

        if unit.programme:
            programme = session.exec(
                select(Programme).where(Programme.id == unit.programme)
            ).all()

            if not programme:
                raise HTTPException(status_code=400, detail="Programme id is invalid.")
    elif unit.type == "standalone":
        db_unit = Unit(
            name=unit.name,
            description=unit.description,
            unit_code=unit.unit_code,
            colour=unit.colour,
            start_date=unit.start_date,
            end_date=unit.end_date,
            programme=None,
        )
    else:
        return HTTPException(status_code=400, detail="Unknown unit type.")

    session.add(db_unit)
    session.commit()
    session.refresh(db_unit)

    return db_unit


@router.get("/{unit_id}", response_model=UnitRead, status_code=status.HTTP_200_OK)
async def get_unit_details(unit_id: UUID, session: session_dependency):
    unit = session.get(Unit, unit_id)

    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found"
        )
    response = UnitRead(unit)
    if unit.start_date is None:
        # we have a programme unit, return the programme dates
        response.start_date = unit.programme.start_date
        response.end_date = unit.programme.end_date

    return unit


@router.put("/{unit_id}", response_model=UnitUpdate, status_code=status.HTTP_200_OK)
async def update_unit(unit_id: UUID, unit: UnitUpdate, session: session_dependency):
    if not unit.name:
        raise HTTPException(status_code=400, detail="Name of unit is required.")

    db_unit = session.get(Unit, unit_id)

    if not db_unit:
        raise HTTPException(status_code=404, detail="Unit not found.")

    if unit.name is not None:
        db_unit.name = unit.name
    if unit.description is not None:
        db_unit.description = unit.description
    if unit.unit_code is not None:
        db_unit.unit_code = unit.unit_code
    if unit.colour is not None:
        db_unit.colour = unit.colour

    if unit.type == "programme":
        if unit.programme is not None:
            db_unit.programme_id = unit.programme
    elif unit.type == "standalone":
        if unit.start_date is not None:
            db_unit.start_date = unit.start_date
        if unit.end_date is not None:
            db_unit.end_date = unit.end_date

    session.add(db_unit)
    session.commit()
    session.refresh(db_unit)

    return db_unit


@router.delete("/{unit_id}")
async def delete_unit(unit_id: UUID, session: session_dependency):
    unit = session.get(Unit, unit_id)

    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found."
        )

    session.delete(unit)
    session.commit()

    return


@router.get("/u/{user_id}", response_model=UnitAll)
async def get_user_units(user_id: UUID, session: session_dependency):
    response = session.exec(
        select(Unit).join(UnitEnrollment).where(UnitEnrollment.user_id == user_id)
    ).all()

    return response


@router.get("/{unit_id}/courseworks", response_model=CourseworkAll)
async def get_courseworks(unit_id: UUID, session: session_dependency):
    statement = select(Coursework).where(Coursework.unit_id == unit_id)
    courseworks = session.exec(statement).all()
    print(courseworks)
    response = []
    for coursework in courseworks:
        response_courswork = CourseworkRead(
            id=coursework.id,
            name=coursework.name,
            description=coursework.description,
            due_date=coursework.due_date,
            creation_date=coursework.creation_date,
            colour=coursework.colour,
        )
        response.append(response_courswork)

    return CourseworkAll(courseworks=response)


@router.get("/", response_model=UnitAll)
async def get_units(session: session_dependency):
    statement = select(Unit)
    units = session.exec(statement).all()
    return units
