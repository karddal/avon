from datetime import date
from typing import Annotated
from uuid import UUID

from app.core.helpers.gitlab import gl_create_unit, gl_delete_unit, gl_update_unit
from app.core.scopes.scopes import (
    FERoles,
    ResourceInformation,
    Scopes,
    authenticate_user,
    require_role,
    require_scopes,
)
from app.routers.unit_enrollment import create_owner_enrollment
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import or_
from sqlmodel import Session, select
from sqlalchemy.orm.strategy_options import selectinload
from app.core.settings import settings

from app.core.security import get_bearer, get_current_user_with_role
from app.db.session import get_session
from app.models.programme import Programme
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.security import CurrentUser
from app.schemas.unit import (
    CourseworkAll,
    UnitAll,
    UnitAllByGroup,
    UnitCreate,
    UnitCreateOwner,
    UnitRead,
    UnitUpdate,
    UnitLecturers,
    UnitReadWithDates,
    UnitEventRead,
    UnitStudents,
    UnitUsers,
)

router = APIRouter(prefix="/units", tags=["units"])
session_dependency = Annotated[Session, Depends(get_session)]
token_dependency = Annotated[HTTPAuthorizationCredentials, Depends(get_bearer)]


today = date.today()


@router.post(
    "/create",
    response_model=UnitCreate,
    status_code=status.HTTP_201_CREATED,
)
async def create_unit(
    unit: UnitCreateOwner, session: session_dependency, token: token_dependency
):
    await require_role(FERoles.ADMIN, token=token, session=session)

    if unit.programme_id:
        programme = session.exec(
            select(Programme).where(Programme.id == unit.programme_id)
        ).first()

        if not programme:
            raise HTTPException(status_code=400, detail="Programme id is invalid.")

    if not unit.owner:
        raise HTTPException(status_code=400, detail="Owner is required.")

    statement = select(Unit.id).where(
        Unit.name == unit.name,
        Unit.unit_code == unit.unit_code,
        Unit.programme_id == unit.programme_id,
    )
    existing_units = session.exec(statement).all()
    if len(existing_units) > 0:
        raise HTTPException(
            status_code=400, detail="Unit already exists with same name or unit code"
        )

    try:
        if settings.testing_mode:
            gl_data = {"gitlabGroupId": 12345678}
        else:
            gl_data = await gl_create_unit(unit.name, programme.gitlab_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GitLab group creation failed.",
        )

    db_unit = Unit(
        name=unit.name,
        description=unit.description,
        unit_code=unit.unit_code,
        colour=unit.colour,
        programme_id=unit.programme_id,
        gitlab_id=gl_data["gitlabGroupId"],
    )
    if unit.unlocked:
        db_unit.unlocked = unit.unlocked
    # Add validation for the start and end dates below

    statement = select(Unit.id).where(
        Unit.name == unit.name,
        Unit.unit_code == unit.unit_code,
        Unit.programme_id == unit.programme_id,
    )
    existing_units = session.exec(statement).all()
    if len(existing_units) > 0:
        raise HTTPException(
            status_code=400, detail="Unit already exists with same name or unit code"
        )

    session.add(db_unit)
    session.flush()

    create_owner_enrollment(db_unit.id, unit.owner, session)  # add the owner here.

    session.commit()
    session.refresh(db_unit)

    return db_unit


@router.get("/units-by-programme", response_model=UnitAllByGroup)
async def get_units_by_programme(session: session_dependency, token: token_dependency):
    await require_role(FERoles.ADMIN, session=session, token=token)
    results = session.exec(
        select(Programme).options(selectinload(Programme.units))
    ).all()
    return UnitAllByGroup(programmes=results)


@router.get("/active", response_model=UnitAll)
async def active_units(session: session_dependency, token: token_dependency):
    await require_role(FERoles.ADMIN, session=session, token=token)
    results = session.exec(select(Unit).join(UnitEnrollment)).unique()
    today = date.today()
    filtered = filter(
        lambda unit: unit.programme.start_date <= today <= unit.programme.end_date,
        results,
    )
    return UnitAll(units=filtered)


@router.get("/units", response_model=list[UnitEventRead])
def list_units_for_events(
    session: session_dependency,
    current_user: CurrentUser = Depends(get_current_user_with_role),
):

    if current_user.role == "admin":
        statement = (
            select(Unit)
            .join(Programme)
            .where(Programme.end_date >= today)
            .options(selectinload(Unit.programme))
        )

    else:
        statement = (
            select(Unit)
            .join(UnitEnrollment)
            .join(Programme)
            .where(
                UnitEnrollment.user_id == current_user.user_id,
                Programme.end_date >= today,
            )
            .options(selectinload(Unit.programme))
        )

    units = session.exec(statement).all()
    return [
        {
            "id": unit.id,
            "name": unit.name,
            "unit_code": unit.unit_code,
            "programme_start_date": str(unit.programme.start_date.year),
            "programme_end_date": str(unit.programme.end_date.year),
        }
        for unit in units
    ]


@router.get("/{unit_id}", response_model=UnitRead, status_code=status.HTTP_200_OK)
async def get_unit_details(
    unit_id: UUID, session: session_dependency, token: token_dependency
):
    await require_scopes(
        ResourceInformation(Unit, unit_id),
        Scopes.UNIT_READ,
        token=token,
        session=session,
    )

    unit = session.get(Unit, unit_id)

    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found"
        )

    print("[BACKEND] UNIT:", unit)

    return unit


@router.get(
    "/{unit_id}/with_dates",
    response_model=UnitReadWithDates,
    status_code=status.HTTP_200_OK,
)
async def get_unit_with_dates(
    unit_id: UUID, session: session_dependency, token: token_dependency
):
    await require_scopes(
        ResourceInformation(Unit, unit_id),
        Scopes.UNIT_READ,
        token=token,
        session=session,
    )
    unit = session.get(Unit, unit_id)
    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found"
        )

    start = unit.programme.start_date
    end = unit.programme.end_date

    return UnitReadWithDates(
        id=unit.id,
        name=unit.name,
        description=unit.description,
        creation_date=unit.creation_date,
        unit_code=unit.unit_code,
        colour=unit.colour,
        programme_id=unit.programme_id,
        unlocked=unit.unlocked,
        start_date=start,
        end_date=end,
    )


@router.get(
    "/{unit_id}/lecturers", response_model=UnitLecturers, status_code=status.HTTP_200_OK
)
async def get_unit_lecturers(
    unit_id: UUID, session: session_dependency, token: token_dependency
):
    await require_scopes(
        ResourceInformation(Unit, unit_id),
        Scopes.UNIT_READ,
        token=token,
        session=session,
    )

    lects = session.exec(
        select(UnitEnrollment.user_id)
        .join(Unit)
        .where(Unit.id == unit_id)
        .where(or_(UnitEnrollment.type == "lecturer", UnitEnrollment.type == "owner"))
    ).all()
    if not lects:
        raise HTTPException(status_code=404, detail="No lecturers found.")
    return UnitLecturers(
        lecturers=lects,
    )


@router.get(
    "/{unit_id}/students", response_model=UnitStudents, status_code=status.HTTP_200_OK
)
async def get_unit_students(
    unit_id: UUID, session: session_dependency, token: token_dependency
):
    await require_scopes(
        ResourceInformation(Unit, unit_id),
        Scopes.UNIT_MANAGE,
        token=token,
        session=session,
    )

    studs = session.exec(
        select(UnitEnrollment.user_id)
        .join(Unit)
        .where(Unit.id == unit_id)
        .where(UnitEnrollment.type == "student")
    ).all()
    if not studs:
        raise HTTPException(status_code=404, detail="No students found.")
    return UnitStudents(
        students=studs,
    )


@router.get(
    "/{unit_id}/users", response_model=UnitUsers, status_code=status.HTTP_200_OK
)
async def get_unit_users(unit_id: UUID, session: session_dependency):
    users = session.exec(
        select(UnitEnrollment.user_id)
        .join(Unit)
        .where(Unit.id == unit_id)
        .where(UnitEnrollment.type != "admin")
    ).all()
    if not users:
        raise HTTPException(status_code=404, detail="No users found.")
    return UnitUsers(
        users=users,
    )


@router.put("/{unit_id}", response_model=UnitUpdate, status_code=status.HTTP_200_OK)
async def update_unit(
    unit_id: UUID,
    unit: UnitUpdate,
    session: session_dependency,
    token: token_dependency,
):

    await require_scopes(
        ResourceInformation(type=Unit, id=unit_id),
        Scopes.UNIT_MANAGE,
        token=token,
        session=session,
    )

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

    try:
        if not settings.testing_mode:
            await gl_update_unit(db_unit.gitlab_id, db_unit.name)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Database failed. GitLab group rolled back.",
        )

    return db_unit


@router.delete("/{unit_id}")
async def delete_unit(
    unit_id: UUID, session: session_dependency, token: token_dependency
):

    await require_scopes(
        ResourceInformation(type=Unit, id=unit_id),
        Scopes.UNIT_DELETE,
        token=token,
        session=session,
    )

    unit = session.get(Unit, unit_id)

    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found."
        )

    try:
        if not settings.testing_mode:
            await gl_delete_unit(unit.gitlab_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database failed. GitLab group rolled back.",
        )

    session.delete(unit)
    session.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{unit_id}/courseworks", response_model=CourseworkAll)
async def get_courseworks(
    unit_id: UUID, session: session_dependency, token: token_dependency
):
    await require_scopes(
        ResourceInformation(Unit, unit_id),
        Scopes.UNIT_READ,
        token=token,
        session=session,
    )

    unit = session.get(Unit, unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found"
        )
    courseworks = unit.courseworks
    return CourseworkAll(courseworks=courseworks)


@router.get("/", response_model=UnitAll)
async def get_units(session: session_dependency, token: token_dependency):
    await require_role(FERoles.ADMIN, session=session, token=token)
    statement = select(Unit)
    units = session.exec(statement).all()
    return {"units": units}


@router.get("/{id}/scopes")
async def get_unit_scopes(
    id: UUID, session: session_dependency, token: token_dependency
):
    unit = session.get(Unit, id)

    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found"
        )

    user = await authenticate_user(
        resource=ResourceInformation(type=Unit, id=id),
        token=token,
        session=session,
    )

    return {"scopes": [scope.value for scope in user.scopes]}


@router.put("/{unit_id}/unlock")
async def unlockUnit(
    unit_id: UUID, token: token_dependency, session: session_dependency
):
    await require_scopes(
        ResourceInformation(type=Unit, id=unit_id),
        Scopes.UNIT_MANAGE,
        token=token,
        session=session,
    )
    db_unit = session.get(Unit, unit_id)
    if not db_unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found"
        )

    db_unit.unlocked = True

    session.commit()
    session.refresh(db_unit)

    return {"success": True}


@router.put("/{unit_id}/lock")
async def lockUnit(unit_id: UUID, token: token_dependency, session: session_dependency):
    await require_scopes(
        ResourceInformation(type=Unit, id=unit_id),
        Scopes.UNIT_MANAGE,
        token=token,
        session=session,
    )
    db_unit = session.get(Unit, unit_id)
    if not db_unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found"
        )

    db_unit.unlocked = False

    session.commit()
    session.refresh(db_unit)

    return {"success": True}
