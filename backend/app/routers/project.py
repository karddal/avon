
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.helpers.gitlab import gl_create_fork, gl_create_project, gl_create_skeleton_code, gl_create_template_group, gl_create_template_project, gl_delete_project, gl_delete_projects, gl_get_project, gl_get_projects
from app.db.session import get_session
from app.models.coursework import Coursework
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.project import ProjectCreate, ProjectFork, ProjectRead, ProjectSkeleton, ProjectsInCoursework, TemplateCreate

router = APIRouter(prefix="/projects", tags=["projects"])
session_dependency = Annotated[Session, Depends(get_session)]

@router.get("/health")
async def health_check():
    return {"health-check": "alive"}

@router.post("/template", status_code=status.HTTP_201_CREATED)
async def create_templates(template: TemplateCreate, session: session_dependency):
    statement = select(Coursework.gitlab_id).where(Coursework.id == template.coursework_id)
    gitlab_id = session.exec(statement).first()
    try:
        gl_template_group = await gl_create_template_group(gitlab_id)
    except Exception:
        raise HTTPException(                
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Template could not be created"
        )

    try:
        await gl_create_template_project(gl_template_group["gitlabGroupId"])
    except Exception:
        raise HTTPException(                
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Template could not be created"
        )

    return {"success": "i think"}

@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_projects(project: ProjectCreate, session: session_dependency):
    # Figure out how many projects you need to make
    # Get the unit the coursework is in
    statement = select(Coursework.unit_id, Coursework.name, Coursework.gitlab_id).where(Coursework.id == project.coursework_id)
    cw_object = session.exec(statement).first()
    unit_id, name, gitlab_id = cw_object

    # Get the student enrollment
    statement = select(UnitEnrollment.user_id).where((UnitEnrollment.unit_id == unit_id) & (UnitEnrollment.type == "student"))
    students_enrolled = session.exec(statement).all()

    for student in students_enrolled:
        try:
            await gl_create_project(name, student, gitlab_id, project.template_group_id, project.template_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Project for the student: " + student + " could not be created."
            )
    # Get the number of students enrolled onto a unit, by the courseworkid courseworkid -> unit -> unit_enrollement
    # Make an API call to gitlab to create a project using a helper function for those many students
    return {"unit id": students_enrolled}

@router.post("/skeleton-code", status_code=status.HTTP_201_CREATED)
async def create_skeleton_code(details: ProjectSkeleton):
    return await gl_create_skeleton_code(details.group_id, details.coursework_name)

@router.post("/create-fork", status_code=status.HTTP_201_CREATED)
async def create_fork(project: ProjectFork, session: session_dependency):
    statement = select(Coursework.unit_id, Coursework.name, Coursework.gitlab_id).where(Coursework.id == project.coursework_id)
    cw_object = session.exec(statement).first()
    unit_id, name, gitlab_id = cw_object

    # Get the student enrollment
    statement = select(UnitEnrollment.user_id).where((UnitEnrollment.unit_id == unit_id) & (UnitEnrollment.type == "student"))
    students_enrolled = session.exec(statement).all()

    for student in students_enrolled:
        try:
            # Call helper function to create project
            await gl_create_fork(name, user_id=student, group_id=gitlab_id, template_id=project.template_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Project for the student: " + student + " could not be created."
            )
    # Get the number of students enrolled onto a unit, by the courseworkid courseworkid -> unit -> unit_enrollement
    # Make an API call to gitlab to create a project using a helper function for those many students
    return {"unit id": students_enrolled} 

@router.get("/{project_id}", response_model=ProjectRead)
async def get_specific_project(project_id: int):
    project = await gl_get_project(project_id)
    return project

@router.delete("{project_id}", status_code=201)
async def delete_specific_project(project_id: int):
    return await gl_delete_project(project_id)

@router.get("/groups/{group_id}", response_model=ProjectsInCoursework)
async def get_projects(group_id: int):
    # Collect all the projects
    projects = await gl_get_projects(group_id)
    return ProjectsInCoursework(projects=projects)

@router.delete("/groups/{group_id}")
async def delete_projects(group_id: int):
    response = await gl_delete_projects(group_id)
    return response