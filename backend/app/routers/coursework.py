import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.security import get_current_user
from app.db.session import get_session
from typing import Annotated, Optional
from uuid import UUID

from app.models.coursework import Coursework
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.coursework import CourseworkCreate, CourseworkRead, CourseworkUpdate, CourseworkDelete, \
    CourseworkEventRead

router = APIRouter(prefix = "/coursework", tags=["coursework"])
session_dependency = Annotated[Session, Depends(get_session)]


@router.post('/create', response_model = CourseworkRead, status_code=status.HTTP_201_CREATED)
async def create_coursework(coursework: CourseworkCreate, session: session_dependency):
    courseworkAlreadyExists = session.exec(select(Coursework).where((Coursework.unit_id == coursework.unit_id) & (Coursework.name == coursework.name))).first()
   
    if courseworkAlreadyExists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coursework already made that belongs to the same unit and has the same name")
    
    if coursework.unit_id is not None:
        unit_exists = session.exec(select(Unit).where(Unit.id == coursework.unit_id)).first()
        if not unit_exists:
            raise HTTPException(status_code=404, detail='Corresponding unit not found')

    db_coursework = Coursework(name=coursework.name,description=coursework.description,unit_id=coursework.unit_id, due_date=coursework.due_date, colour=coursework.colour)
    print("data base",db_coursework.due_date)
    session.add(db_coursework)
    session.commit()
    session.refresh(db_coursework)
    return db_coursework

@router.get('/{id}', response_model = CourseworkRead)
async def get_coursework(id: UUID, session: session_dependency):
    coursework = session.get(Coursework,id)

    if coursework is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Coursework not found')
    return coursework

@router.delete('/{id}', response_model=CourseworkDelete)
async def delete_coursework(id: UUID, session: session_dependency):
    coursework = session.get(Coursework,id)

    if coursework is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Coursework not found')
    #print("\n\n\n\n\n\n\n")
    session.delete(coursework)
    session.commit()

    #print("got here")
    courseworkDeleted = CourseworkDelete(id=id, deletion_successful=True)
    #print(courseworkDeleted)
    return courseworkDeleted

@router.put('/{id}', response_model=CourseworkRead)
async def update_coursework(id: UUID, coursework: CourseworkUpdate, session: session_dependency):
    coursework_db = session.get(Coursework, id)

    if coursework_db is None:
        raise HTTPException(status_code=404, detail='Coursework not found')

    if coursework.unit_id is not None:
        unit_exists = session.exec(select(Unit).where(Unit.id == coursework.unit_id)).first()
        if not unit_exists:
            raise HTTPException(status_code=404, detail='Corresponding unit not found')

    coursework_data = coursework.model_dump(exclude_unset=True)
    coursework_db.sqlmodel_update(coursework_data)

    session.add(coursework_db)
    session.commit()
    session.refresh(coursework_db)
    return coursework_db

@router.get("/events", response_model=list[CourseworkEventRead])
async def list_coursework_events(
        session: session_dependency,
        from_: Optional[datetime.datetime] = None,
        to: Optional[datetime.datetime] = None,
        unit_ids: Optional[list[UUID]] = None,
        current_user_id: str = Depends(get_current_user)
        ):
    statement = select(Coursework, Unit).join(Unit).join(UnitEnrollment).where(UnitEnrollment.user_id == current_user_id)

    # TODO: currently useless code, I thought that we might need a function that can hide some coursework to student
    # enrollment_type = Optional[Literal["student", "lecturer"]] = None
    # if enrollment_type:
    #     statement = statement.where(UnitEnrollment.type == enrollment_type)

    if unit_ids:
        statement = statement.where(Coursework.unit_id.in_(unit_ids))
    if from_:
        statement = statement.where(Coursework.due_date >= from_)
    if to:
        statement = statement.where(Coursework.due_date < to)

    rows = session.exec(statement).all()

    return [
        {
            "id": coursework.id,
            "name": coursework.name,
            "due_date": coursework.due_date,
            "unit_id": str(unit.id),
            "unit_name": unit.unit_name,
            "colour": coursework.colour,
        }
        for coursework, unit in rows
    ]