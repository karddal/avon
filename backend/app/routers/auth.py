from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import get_current_user, authenticate_user, create_access_token, Token
from app.db.session import get_session
from app.models.user import User
from datetime import timedelta

router = APIRouter(prefix = "/auth", tags=["auth"])

@router.post("/token", response_model=Token)
async def me_units(form_data: OAuth2PasswordRequestForm = Depends(), session_dependency = Depends(get_session)):
    try:
        user = authenticate_user(form_data.username, form_data.password, session=session_dependency)
    except(Exception):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.email}, expires_delta=timedelta(minutes=30))

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
