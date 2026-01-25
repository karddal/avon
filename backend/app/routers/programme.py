from typing import Annotated
from fastapi import APIRouter, Depends, status
from app.db.session import get_session
from sqlmodel import Session, select
from uuid import UUID
from fastapi import HTTPException

from app.models.programme import Programme
from app.schemas.programme import ProgrammeCreate, ProgrammeRead, ProgrammeDelete

router = APIRouter(prefix="/programmes", tags=["programmes"])
session_dependency = Annotated[Session, Depends(get_session)]


@router.post('/create', response_model = ProgrammeRead, status_code=status.HTTP_201_CREATED)
async def create_programme(programme: ProgrammeCreate, session: session_dependency):
    db_programme = Programme(
        name=programme.name,
        start_date=programme.start_date,
        end_date=programme.end_date,
    )

    session.add(db_programme)
    session.commit()
    session.refresh(db_programme)

    return db_programme

@router.get("/all", response_model=list[ProgrammeRead])
async def list_programmes(session: session_dependency):
    statement = select(Programme)
    programmes = session.exec(statement).all()
    return programmes

@router.delete('/{id}', response_model=ProgrammeDelete)
async def delete_programme(id: UUID, session: session_dependency):
    programme = session.get(Programme,id)

    if programme is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Programme not found')
    session.delete(programme)
    session.commit()

    programmeDeleted = ProgrammeDelete(id=id, deletion_successful=True)
    return programmeDeleted
