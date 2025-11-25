from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.core.security import get_current_user
from app.db.session import get_session
from app.models.coursework import Coursework
from app.models.user import User
from typing import Annotated

router = APIRouter(prefix = "/me", tags=["me"])
session_dependency = Annotated[Session, Depends(get_session)]

@router.get("/units")
async def me_units(session: session_dependency, me: User = Depends(get_current_user)):
  return me.units

@router.get("/courseworks")
async def me_courseworks(session: session_dependency, me: User = Depends(get_current_user)):
  print("Fetching courseworks for user:", me)
  courseworks = []
  for unit in me.units:
    courseworks.extend(session.exec(select(Coursework).where(Coursework.unit_id == unit.id)))
  return courseworks
