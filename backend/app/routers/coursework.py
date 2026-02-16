from app.core.helpers.gitlab import gl_create_coursework
from sqlalchemy.orm import selectinload
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.db.session import get_session
from typing import Annotated
from uuid import UUID
from app.core.settings import settings

from app.models.coursework import Coursework
from app.models.unit import Unit, UnitWithCourseworks
from app.schemas.coursework import CourseworkCreate, CourseworkRead, CourseworkUpdate, CourseworkDelete
from app.schemas.coursework import CourseworkUpdateFormData

router = APIRouter(prefix = "/coursework", tags=["coursework"])
session_dependency = Annotated[Session, Depends(get_session)]


@router.post('/create', response_model = CourseworkRead, status_code=status.HTTP_201_CREATED)
async def create_coursework(coursework: CourseworkCreate, session: session_dependency):
    courseworkAlreadyExists = session.exec(select(Coursework).where((Coursework.unit_id == coursework.unit_id) & (Coursework.name == coursework.name) & (Coursework.due_date == coursework.due_date))).first()
   
    if courseworkAlreadyExists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coursework already made that belongs to the same unit and has the same name")
    
    if coursework.unit_id is not None:
        unit_exists = session.exec(select(Unit).where(Unit.id == coursework.unit_id)).first()
        if not unit_exists:
            raise HTTPException(status_code=404, detail='Corresponding unit not found')
        
    try:
        if settings.testing_mode:
            gl_data = {"gitlabGroupId": 12345678}
        else:
            gl_data = await gl_create_coursework(coursework.name, unit_exists.gitlab_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, 
            detail="Database failed. GitLab group rolled back."
    )

    db_coursework = Coursework(name=coursework.name,description=coursework.description,unit_id=coursework.unit_id, due_date=coursework.due_date, colour=coursework.colour, gitlab_id=gl_data["gitlabGroupId"])
    
    session.add(db_coursework)
    session.commit()
    session.refresh(db_coursework)
    return db_coursework

@router.get("/all")
async def all_courseworks(session: session_dependency):
    statement = (select(Unit).options(selectinload(Unit.courseworks), selectinload(Unit.programme),))

    units = session.exec(statement).all()

    results = [
        UnitWithCourseworks(
            id=unit.id,
            unit_code=unit.unit_code,
            name=unit.name,
            programme_start_date=unit.programme.start_date,
            programme_end_date=unit.programme.end_date,
            courseworks=unit.courseworks,
        ).model_dump()
        for unit in units
    ]

    return results
@router.get('/{id}/update_form_data', response_model=CourseworkUpdateFormData)
async def get_coursework_update_form_data(id: UUID, session: session_dependency):
    coursework = session.get(Coursework, id)
    unit = coursework.unit

    return CourseworkUpdateFormData(
        id=coursework.id,
        name=coursework.name,
        description=coursework.description,
        unit_id=unit.id,
        due_date=coursework.due_date,
        creation_date=coursework.creation_date,
        colour=coursework.colour,
        unit_name=unit.name,
        unit_code=unit.unit_code,
        max_end_date=unit.programme.end_date,
    )


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

