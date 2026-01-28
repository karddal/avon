from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlmodel import Session, select
from sqlalchemy.orm.strategy_options import selectinload

from app.db.session import get_session
from app.models.programme import Programme
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.unit import (
    CourseworkAll,
    UnitAll,
    UnitAllByGroup,
    UnitCreate,
    UnitRead,
    UnitUpdate, UnitLecturers, UnitReadWithDates, UnitStudents
)

router = APIRouter(prefix="/units", tags=["units"])
session_dependency = Annotated[Session, Depends(get_session)]


@router.post(
    "/create",
    response_model=UnitCreate,
    status_code=status.HTTP_201_CREATED,
)
async def create_unit(unit: UnitCreate, session: session_dependency):
    print("Unit", unit)
    
    db_unit = Unit(
        name=unit.name,
        description=unit.description,
        unit_code=unit.unit_code,
        colour=unit.colour,
        programme_id=unit.programme_id,
    )
    # Add validation for the start and end dates below

    if unit.programme_id:
        programme = session.exec(
            select(Programme).where(Programme.id == unit.programme_id)
        ).all()

        if not programme:
            raise HTTPException(status_code=400, detail="Programme id is invalid.")

    session.add(db_unit)
    session.commit()
    session.refresh(db_unit)
    return db_unit

@router.get("/units-by-programme", response_model=UnitAllByGroup)
async def get_units_by_programme(session: session_dependency):
    results = session.exec(
        select(Programme).options(selectinload(Programme.units))
    ).all()
    return UnitAllByGroup(programmes=results)

@router.get("/active", response_model=UnitAll)
async def active_units(session: session_dependency):
    results = session.exec(select(Unit).join(UnitEnrollment)).unique()
    today = date.today()
    filtered = filter(lambda unit: unit.programme.start_date <= today <= unit.programme.end_date, results)
    return UnitAll(
        units=filtered
    )


@router.get("/{unit_id}", response_model=UnitRead, status_code=status.HTTP_200_OK)
async def get_unit_details(unit_id: UUID, session: session_dependency):
    unit = session.get(Unit, unit_id)

    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found"
        )

    return unit

@router.get("/{unit_id}/with_dates", response_model=UnitReadWithDates, status_code=status.HTTP_200_OK)
async def get_unit_with_dates(unit_id: UUID, session: session_dependency):
    unit = session.get(Unit, unit_id)
    start = unit.programme.start_date
    end = unit.programme.end_date
    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found"
        )

    return UnitReadWithDates(
        id=unit.id,
        name=unit.name,
        description=unit.description,
        creation_date=unit.creation_date,
        unit_code=unit.unit_code,
        colour=unit.colour,
        programme_id=unit.programme_id,
        start_date=start,
        end_date=end,
    )

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

@router.get("/{unit_id}/students", response_model=UnitStudents, status_code=status.HTTP_200_OK)
async def get_unit_students(unit_id: UUID, session: session_dependency):
    studs = session.exec(
        select(UnitEnrollment.user_id).join(Unit).where(Unit.id == unit_id).where(UnitEnrollment.type == "student")
    ).all()
    if not studs:
        raise HTTPException(status_code=404, detail="No students found.")
    return UnitStudents(
        students=studs,
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

    return Response(status_code=status.HTTP_204_NO_CONTENT)


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