from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from app.core.security import get_current_user, authenticate_user, create_access_token, Token
from app.db.session import get_session
from app.models.user import User
from datetime import timedelta

router = APIRouter(prefix = "/auth", tags=["auth"])

@router.post("/token", response_model=Token)
async def auth_token(form_data: OAuth2PasswordRequestForm = Depends(), session_dependency = Depends(get_session)):
    try:
        user = authenticate_user(form_data.username, form_data.password, session=session_dependency)
    except(Exception):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.email}, expires_delta=timedelta(minutes=30))

    response = JSONResponse({"access_token": access_token})
    response.set_cookie(key="access_token", value=access_token, httponly=True)
    return response
