
from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.coursework import Coursework
from app.schemas.project import ProjectCreate, ProjectRead

router = APIRouter(prefix="/projects", tags=["projects"])
session_dependency = Annotated[Session, Depends(get_session)]

@router.get("/health")
async def health_check():
    return {"health-check": "alive"}

@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_projects(project: ProjectCreate, session: session_dependency):
    # Figure out how many projects you need to make
    # Get the unit the coursework is in
    statement = select(Coursework.unit_id).where(Coursework.id == project.coursework_id)
    unit_id = session.exec(statement).first()
    print(unit_id)
    # Get the number of students enrolled onto a unit, by the courseworkid courseworkid -> unit -> unit_enrollement
    # Make an API call to gitlab to create a project using a helper function for those many students

    return {"unit id": unit_id}
