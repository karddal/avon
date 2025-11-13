from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID

from sqlmodel import Session, select

from app.db.session import get_session
from typing import Annotated
from app.schemas.unit import UnitCreate, UnitRead, UnitUpdate
from app.models.unit import Unit
from app.models.unit_group import UnitGroup


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
async def delete_unit(user_id: UUID, session: session_dependency):  
  unit = session.get(Unit, user_id)

  if unit is None:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found.")

  session.delete(unit)
  session.commit()

  return