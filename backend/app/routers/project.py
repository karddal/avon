
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.helpers.gitlab import gl_create_project, gl_create_template_group, gl_create_template_project, gl_get_project, gl_get_projects
from app.db.session import get_session
from app.models.coursework import Coursework
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.project import ProjectCreate, ProjectDelete, ProjectRead, ProjectsInCoursework, TemplateCreate

router = APIRouter(prefix="/projects", tags=["projects"])
session_dependency = Annotated[Session, Depends(get_session)]

@router.get("/health")
async def health_check():
    return {"health-check": "alive"}

@router.post("/template", status_code=status.HTTP_201_CREATED)
async def create_templates(template: TemplateCreate, session: session_dependency):
    statement = select(Coursework.gitlab_id).where(Coursework.id == template.coursework_id)
    gitlab_id = session.exec(statement).first()
    print(gitlab_id)
    try:
        gl_template_group = await gl_create_template_group(gitlab_id)
    except Exception:
        raise HTTPException(                
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Template could not be created"
        )

    try:
        gl_template_project = await gl_create_template_project(gl_template_group["gitlabGroupId"])
    except Exception:
        raise HTTPException(                
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Template could not be created"
        )

    print(gl_template_project)
    return {"success": "i think"}

@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_projects(project: ProjectCreate, session: session_dependency):
    # Figure out how many projects you need to make
    # Get the unit the coursework is in
    statement = select(Coursework.unit_id, Coursework.name, Coursework.gitlab_id).where(Coursework.id == project.coursework_id)
    cw_object = session.exec(statement).first()
    unit_id, name, gitlab_id = cw_object
    print(unit_id, name, gitlab_id)

    # Get the student enrollment
    statement = select(UnitEnrollment.user_id).where((UnitEnrollment.unit_id == unit_id) & (UnitEnrollment.type == "student"))
    students_enrolled = session.exec(statement).all()
    print(students_enrolled)

    for student in students_enrolled:
        try:
            gl_project = await gl_create_project(name, student, gitlab_id)
            # Call helper function to create project
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Project for the student: " + student + " could not be created."
            )
    # Get the number of students enrolled onto a unit, by the courseworkid courseworkid -> unit -> unit_enrollement
    # Make an API call to gitlab to create a project using a helper function for those many students
    print(gl_project)
    return {"unit id": students_enrolled}

@router.get("/groups/{group_id}", response_model=ProjectsInCoursework)
async def get_projects(group_id: int):
    # Collect all the projects
    projects = await gl_get_projects(group_id)
    # print(projects)
    return ProjectsInCoursework(projects=projects)

@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(project_id: int):
    project = await gl_get_project(project_id)
    return project

# @router.delete("/{group_id}/{project_id}", status_code=201)
# async def delete_specific_project(group_id: int, project_id: int):
#     return await gl_delete_project(group_id, project_id)