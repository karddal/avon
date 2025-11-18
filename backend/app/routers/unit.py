from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID

from sqlmodel import Session, select

from app.db.session import get_session
from typing import Annotated
from app.schemas.unit import CourseworkAll, CourseworkRead, UnitAll, UnitCreate, UnitRead, UnitUpdate
from app.models.unit import Unit
from app.models.unit_group import UnitGroup
from app.models.coursework import Coursework
from app.models.unit_enrollment import UnitEnrollment


router = APIRouter(prefix="/units", tags=["units"])
session_dependency = Annotated[Session, Depends(get_session)]

@router.post("/create", response_model=UnitCreate, status_code=status.HTTP_201_CREATED)
async def create_unit(unit: UnitCreate, session: session_dependency):

  db_unit = Unit(name=unit.name, description=unit.description)

  if unit.group_ids:
    groups = session.exec(
      select(UnitGroup).where(UnitGroup.id.in_(unit.group_ids))
    ).all()

    if len(groups) != len(unit.group_ids):
      raise HTTPException(status_code=400, detail="One or more group ids are invalid.")

    db_unit.groups.extend(groups)

  session.add(db_unit)
  session.commit()
  session.refresh(db_unit)

  return db_unit

@router.get("/{unit_id}", response_model=UnitRead, status_code=status.HTTP_200_OK)
async def get_unit_details(unit_id: UUID, session: session_dependency):
  unit = session.get(Unit, unit_id)

  if unit is None:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Unit not found')

  return unit

@router.put("/{unit_id}", response_model=UnitUpdate, status_code=status.HTTP_200_OK)
async def update_unit(unit_id: UUID, unit: UnitUpdate, session: session_dependency):
  if not unit.name:
      raise HTTPException(status_code=400, detail="Name of unit is required.")

  db_unit = session.get(Unit, unit_id)

  if not db_unit:
     raise HTTPException(status_code=404, detail="Unit not found.")
  
  if unit.name is not None:
     db_unit.name = unit.name
  if unit.description is not None:
     db_unit.description = unit.description

  if unit.group_ids is not None:
     groups = session.exec(
        select(UnitGroup).where(UnitGroup.id.in_(unit.group_ids))
     ).all()
     db_unit.groups = groups
  
  session.add(db_unit)
  session.commit()
  session.refresh(db_unit)

  return db_unit


@router.delete("/{unit_id}")
async def delete_unit(unit_id: UUID, session: session_dependency):  
  unit = session.get(Unit, unit_id)

  if unit is None:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found.")

  session.delete(unit)
  session.commit()

  return

@router.get("/u/{user_id}", response_model=UnitAll)
async def get_user_units(user_id:UUID, session: session_dependency):
  statement = select(UnitEnrollment).where(UnitEnrollment.user_id == user_id)
  enrollments = session.exec(statement).all()
  print(enrollments)
  response = []
  for enrollment in enrollments:
    statement = select(Unit).where(Unit.id == enrollment.unit_id)
    units = session.exec(statement)
    for unit in units:
      response_unit = UnitRead(name=unit.name, description=unit.description, creation_date=unit.creation_date)
      response.append(response_unit)
  
  return UnitAll(units=response)
       
  # 3d0bdb79-8633-403c-bfe7-c83219ec7864
  return {"hi"} 
  

@router.get("/{unit_id}/courseworks", response_model=CourseworkAll)
async def get_courseworks(unit_id:UUID, session:session_dependency):
  statement = select(Coursework).where(Coursework.unit_id == unit_id)
  courseworks = session.exec(statement).all()
  print(courseworks)
  response = []
  for coursework in courseworks:
      response_courswork = CourseworkRead(id=coursework.id, name=coursework.name, description=coursework.description, due_date=coursework.due_date, creation_date=coursework.creation_date)
      response.append(response_courswork)
    
  return CourseworkAll(courseworks=response)

@router.get("/", response_model=UnitAll)
async def get_units(session:session_dependency):
  statement = select(Unit)
  units = session.exec(statement).all()

  response = []

  for unit in units:
    response_unit = UnitRead(name=unit.name, description=unit.description, creation_date=unit.creation_date)
    response.append(response_unit)

  print("hi",response)
  return UnitAll(units=response)

