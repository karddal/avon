from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.session import get_session
from sqlmodel import Session
from uuid import UUID

from app.models.programme import Programme
from app.schemas.programme import ProgrammeCreate, ProgrammeRead, ProgrammeDelete, ProgrammeUpdate

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

    session.add(programme_db)
    session.commit()
    session.refresh(programme_db)
    return programme_db

# @router.get('/{id}', response_model = CourseworkRead)
# async def get_coursework(id: UUID, session: session_dependency):
#     coursework = session.get(Coursework,id)

#     if coursework is None:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Coursework not found')
#     return coursework

# @router.delete('/{id}', response_model=CourseworkDelete)
# async def delete_coursework(id: UUID, session: session_dependency):
#     coursework = session.get(Coursework,id)

#     if coursework is None:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Coursework not found')
#     #print("\n\n\n\n\n\n\n")
#     session.delete(coursework)
#     session.commit()

#     #print("got here")
#     courseworkDeleted = CourseworkDelete(id=id, deletion_successful=True)
#     #print(courseworkDeleted)
#     return courseworkDeleted

# @router.put('/{id}', response_model=CourseworkRead)
# async def update_coursework(id: UUID, coursework: CourseworkUpdate, session: session_dependency):
#     coursework_db = session.get(Coursework, id)

#     if coursework_db is None:
#         raise HTTPException(status_code=404, detail='Coursework not found')

#     if coursework.unit_id is not None:
#         unit_exists = session.exec(select(Unit).where(Unit.id == coursework.unit_id)).first()
#         if not unit_exists:
#             raise HTTPException(status_code=404, detail='Corresponding unit not found')

#     coursework_data = coursework.model_dump(exclude_unset=True)
#     coursework_db.sqlmodel_update(coursework_data)

#     session.add(coursework_db)
#     session.commit()
#     session.refresh(coursework_db)
#     return coursework_db