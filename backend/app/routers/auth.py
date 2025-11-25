from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from app.core.security import authenticate_user, create_access_token, Token, ALGORITHM
from app.core.settings import settings
from app.db.session import get_session
from datetime import timedelta

from app.schemas.login import IsLecture
from jwt import decode

router = APIRouter(prefix = "/auth", tags=["auth"])

@router.post("/token", response_model=Token)
async def auth_token(form_data: OAuth2PasswordRequestForm = Depends(), session_dependency = Depends(get_session)):
    try:
        user = authenticate_user(form_data.username, form_data.password, session=session_dependency)
    except(Exception):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Incorrect username or password")
    
    access_token = create_access_token(data={
        "sub": user.email,
        "is_lecturer": user.is_lecturer,
        },
        expires_delta=timedelta(minutes=30))

    response = JSONResponse({"access_token": access_token})
    response.set_cookie(key="access_token", value=access_token, httponly=True)
    return response

@router.get("/verify", response_model=IsLecture)
async def is_lecture(request: Request):
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No token")
    try:
        payload = decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM])
        isLecture = payload.get("is_lecturer")
        return JSONResponse({"is_lecturer": isLecture},status_code=status.HTTP_200_OK)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
