from typing import Annotated
from app.core.helpers.gitlab import gl_create_programme, gl_delete_programme, gl_update_programme
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.session import get_session
from sqlmodel import Session, select
from uuid import UUID

from app.models.programme import Programme
from app.schemas.programme import ProgrammeCreate, ProgrammeRead, ProgrammeDelete

from app.schemas.programme import ProgrammeUpdate

router = APIRouter(prefix="/programmes", tags=["programmes"])
session_dependency = Annotated[Session, Depends(get_session)]

@router.post('/create', response_model = ProgrammeRead, status_code=status.HTTP_201_CREATED)
async def create_programme(programme: ProgrammeCreate, session: session_dependency):
    
    programmeAlreadyExists = session.exec(select(Programme).where((Programme.name == programme.name))).first()

    if programmeAlreadyExists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Programme already exists')
    
    try:
        gl_data = await gl_create_programme(programme.name)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Database failed. GitLab group rolled back."
    )

    db_programme = Programme(name=programme.name, start_date=programme.start_date, end_date=programme.end_date, gitlab_id=gl_data["gitlabGroupId"])

    session.add(db_programme)
    session.commit()
    session.refresh(db_programme)

    return db_programme

@router.get("/all", response_model=list[ProgrammeRead])
async def list_programmes(session: session_dependency):
    statement = select(Programme)
    programmes = session.exec(statement).all()
    return programmes

@router.get('/{id}', response_model = ProgrammeRead, status_code=status.HTTP_200_OK)
async def get_programme(id: UUID, session: session_dependency):
    programme = session.get(Programme, id)

    if programme is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Programme not found')
    return programme

@router.delete('/{id}', response_model=ProgrammeDelete)
async def delete_programme(id: UUID, session: session_dependency):
    programme = session.get(Programme,id)

    if programme is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Programme not found')
    try:
        gl_data = await gl_delete_programme(programme.gitlab_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Database failed. GitLab group not deleted."
        )
    
    session.delete(programme)
    session.commit()

    programmeDeleted = ProgrammeDelete(id=id, deletion_successful=True)
    return programmeDeleted

@router.put('/{id}', response_model=ProgrammeRead)
async def update_programme(id: UUID, programme: ProgrammeUpdate, session: session_dependency):
    programme_db = session.get(Programme, id)

    if programme_db is None:
        raise HTTPException(status_code=404, detail='Programme not found')

    programme_data = programme.model_dump(exclude_unset=True)
    programme_db.sqlmodel_update(programme_data)

    try:
        gl_data = await gl_update_programme(programme_db.gitlab_id, programme_db.name)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Database failed. GitLab group rolled back."
        )

    session.add(programme_db)
    session.commit()
    session.refresh(programme_db)
    return programme_db
