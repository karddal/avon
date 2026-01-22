from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.programme import Programme
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.unit import (
    CourseworkAll,
    UnitAll,
    UnitCreate,
    UnitRead,
    UnitUpdate, UnitLecturers,
)

router = APIRouter(prefix="/units", tags=["units"])
session_dependency = Annotated[Session, Depends(get_session)]


@router.post(
    "/create",
    response_model=UnitCreate,
    status_code=status.HTTP_201_CREATED,
)
async def create_unit(unit: UnitCreate, session: session_dependency):
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

    return unit

@router.get("/{unit_id}/lecturers", response_model=UnitLecturers, status_code=status.HTTP_200_OK)
async def get_unit_lecturers(unit_id: UUID, session: session_dependency):
    lects = session.exec(
        select(UnitEnrollment.user_id).join(Unit).where(Unit.id == unit_id).where(UnitEnrollment.type == "lecturer")
    ).all()
    print(lects)
    if not lects:
        raise HTTPException(status_code=404, detail="No lecturers found.")
    return UnitLecturers(
        lecturers=lects,
    )

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
    if unit.programme_id is not None:
        db_unit.programme_id = unit.programme_id

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
    unit = session.get(Unit, unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail = "Unit not found"
        )
    courseworks = unit.courseworks
    print(courseworks)
    return CourseworkAll(courseworks=courseworks)


@router.get("/", response_model=UnitAll)
async def get_units(session: session_dependency):
    statement = select(Unit)
    units = session.exec(statement).all()
    return units
