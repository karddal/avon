from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.session import get_session
from sqlmodel import Session
from datetime import date

from app.models.programme import Programme
from app.schemas.programme import ProgrammeCreate, ProgrammeRead

router = APIRouter(prefix="/programmes", tags=["programmes"])
session_dependency = Annotated[Session, Depends(get_session)]


@router.post('/create', response_model = ProgrammeRead, status_code=status.HTTP_201_CREATED)
async def create_programme(programme: ProgrammeCreate, session: session_dependency):
    # Leap year stuff
    try:
        end_date = programme.start_date.replace(year=programme.start_date.year + 1)
    except ValueError:
        end_date = programme.start_date.replace(month=2, day=28, year=programme.start_date.year + 1)

    db_programme = Programme(
        name=programme.name,
        start_date=programme.start_date,
        end_date=end_date,
    )

    session.add(db_programme)
    session.commit()
    session.refresh(db_programme)

    return db_programme
