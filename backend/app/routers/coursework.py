from http.client import responses

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.db.session import get_session
from typing import Annotated
from uuid import UUID

from app.models.coursework import Coursework
from app.schemas.coursework import CourseworkCreate, CourseworkRead, CourseworkUpdate, CourseworkDelete

router = APIRouter(prefix = "/coursework")
session_dependency = Annotated[Session, Depends(get_session)]


@router.post('/create', response_model = CourseworkRead, status_code=status.HTTP_201_CREATED)
async def create_user(coursework: CourseworkCreate, session: session_dependency):
    db_user = session.exec(select(Coursework).where((Coursework.unit_id == coursework.unit_id) and (Coursework.name == coursework.name))).first()
    
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coursework already made that belongs to the same unit and has the same name")
    
    db_coursework = Coursework(name=coursework.name,description=coursework.description,unit_id=coursework.unit_id, due_date=coursework.due_date)
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

@router.delete('/{id}')
async def delete(id: UUID, session: session_dependency):
    coursework = session.get(Coursework,id)

    if coursework is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Coursework not found')
    
    session.delete(coursework)
    session.commit()
    
    return 

@router.put('/{id}', response_model = CourseworkRead)
async def update_user(id: UUID, coursework: CourseworkUpdate, session: session_dependency):
    coursework_db = session.get(Coursework,id)

    if coursework_db is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Coursework not found')
    
    if coursework.unit_id is not None:
        unit_exists = session.exec(select(Unit).where(Unit.id == coursework.unit_id)).first()
        if not unit_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Corresponding unit not found")

    coursework_data = coursework.model_dump(exclude_unset=True)
    coursework_db.sqlmodel_update(coursework_data)

    session.add(coursework_db)
    session.commit()
    session.refresh(coursework_db)
    return coursework_db
