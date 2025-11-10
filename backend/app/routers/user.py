from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db.session import get_session
from typing import Annotated

from app.models.user import User
from app.schemas.user import UserCreate

router = APIRouter(prefix = "/users")
session_dependency = Annotated[Session, Depends(get_session)]

@router.post('/create')
async def create_user(user: UserCreate, session: session_dependency):
    db_user = User.model_validate(user)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

# @router.delete('/delete')
# async def delete_user(id: UUID, session: session_dependency):