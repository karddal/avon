from datetime import timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from app.core.security import hash_password, Token, authenticate_user, create_access_token
from app.core.settings import settings
from app.db.session import get_session
from typing import Annotated

from app.models.user import User
from app.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/users", tags=["users"])
session_dependency = Annotated[Session, Depends(get_session)]


@router.post('/create', response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, session: session_dependency):
    # checker weather the user is already exist
    #currenttly using each student should have different
    #maybe need to change when we decide our login method
    db_user = session.exec(select(User).where(User.email == user.email)).first()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    db_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        hashed_password=hash_password(user.password),
        is_lecturer=user.is_lecturer,
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return db_user


@router.get('/{user_id}', response_model=UserRead)
async def get_details(user_id: UUID, session: session_dependency):
    user = session.get(User, user_id)

    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')

    return user


@router.delete('/{user_id}')
async def delete_user(user_id: UUID, session: session_dependency):
    user = session.get(User, user_id)

    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    session.delete(user)
    session.commit()

    return

#some example login for test password security
# @router.post("/login", response_model=UserRead)
# async def login(login_data: UserLogin, session: session_dependency):
#     db_user = session.exec(select(User).where(User.email == login_data.email)).first()
#
#     if not db_user or not verify_password(login_data.password, db_user.hashed_password):
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email or password")
#
#     return db_user

@router.post("/token")
async def login_for_access_token(
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
        session: session_dependency,
) -> Token:
    user = authenticate_user(form_data.username, form_data.password, session=session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate creds",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expiry_minutes)
    access_token = create_access_token(
        data = {"sub", user.id}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

