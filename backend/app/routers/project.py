from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import Session, select

from datetime import datetime, timedelta
import asyncio

from app.db.session import engine

from app.core.helpers.gitlab import gl_create_fork, gl_create_project, gl_create_skeleton_code, gl_create_template_group, gl_create_template_project, gl_delete_project, gl_delete_projects, gl_get_project, gl_get_projects
from app.core.helpers.invitations import (
    gl_inv_add_user,
    gl_inv_batch_get_statuses,
    gl_inv_delete,
    gl_inv_list,
)
from app.db.session import get_session
from app.models.coursework import Coursework
from app.models.projects import ProvisionProject
from app.models.student_repo import StudentRepo
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.project import (
    CreateProjectForkForSpecificStudent,
    ProjectCreate,
    ProjectFork,
    ProjectInviteCreate,
    ProjectInviteDelete,
    ProjectInviteList,
    ProjectInviteListResponse,
    ProjectInviteResult,
    ProjectInviteStatusBatchCreate,
    ProjectInviteStatusBatchResponse,
    ProjectRead,
    ProjectsInCoursework,
    ProjectSkeleton,
    TemplateCreate,
)


router = APIRouter(prefix="/projects", tags=["projects"])
session_dependency = Annotated[Session, Depends(get_session)]


@router.get("/health")
async def health_check():
    return {"health-check": "alive"}


@router.post("/template", status_code=status.HTTP_201_CREATED)
async def create_templates(template: TemplateCreate, session: session_dependency):
    statement = select(Coursework.gitlab_id).where(
        Coursework.id == template.coursework_id
    )
    gitlab_id = session.exec(statement).first()
    try:
        gl_template_group = await gl_create_template_group(gitlab_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Template could not be created",
        )

    try:
        await gl_create_template_project(gl_template_group["gitlabGroupId"])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Template could not be created",
        )

    return {"success": True}

@router.post("/skeleton-code", status_code=status.HTTP_201_CREATED)
async def create_skeleton_code(details: ProjectSkeleton):
    return await gl_create_skeleton_code(details.group_id, details.coursework_name)

# Creating the fork creates the project. Use this.
@router.post("/create-fork", status_code=status.HTTP_201_CREATED)
async def create_fork(project: ProjectFork, session: session_dependency):
    # Add projects to be provisioned to the queue (yes the queue is a table)
    # This is essentially the producer
    statement = select(Coursework.unit_id, Coursework.name, Coursework.gitlab_id).where(Coursework.id == project.coursework_id)
    cw_object = session.exec(statement).first()
    unit_id, cw_name, gitlab_id = cw_object

    # Get the students enrolled
    statement = select(UnitEnrollment.user_id).where((UnitEnrollment.unit_id == unit_id) & (UnitEnrollment.type == "student"))
    students_enrolled = session.exec(statement).all()

    # Add them to the queue
    for student in students_enrolled:
        job = ProvisionProject(
            student_id=student,
            cw_id=project.coursework_id,
            cw_name=cw_name,
            gitlab_id=gitlab_id,
            template_id=project.template_id,
            status="pending"
        )
        session.add(job)
        
    session.commit()
    return {"queued": len(students_enrolled)}

@router.delete("/clear-queue")
async def clear_queue(session: session_dependency):
    statement = select(ProvisionProject)
    jobs = session.exec(statement).all()
    for job in jobs:
        session.delete(job)
    session.commit()
    statement = select(ProvisionProject)
    jobs = session.exec(statement).all()
    return {"all gone"}
  
@router.post("/create-fork-for-student", status_code=status.HTTP_201_CREATED)
async def create_fork_specific_student(
    project: CreateProjectForkForSpecificStudent, session: session_dependency
):
    statement = select(
        Coursework.unit_id, Coursework.name, Coursework.gitlab_id
    ).where(Coursework.id == project.coursework_id)
    cw_object = session.exec(statement).first()
    unit_id, name, gitlab_id = cw_object

    created = []
    failed = []
    for student in project.student_ids:
        try:
            if not session.exec(
                select(UnitEnrollment).where(
                    (UnitEnrollment.unit_id == unit_id)
                    & (UnitEnrollment.user_id == student)
                    & (UnitEnrollment.type == "student")
                )
            ).first():
                return HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Could not find that student",
                )

            data = await gl_create_fork(
                name,
                user_id=student,
                group_id=gitlab_id,
                template_id=project.template_id,
            )
            http_url_to_repo = data["http_url_to_repo"]
            repo_id = data["id"]

            db_exists = session.exec(
                select(StudentRepo).where(
                    (StudentRepo.student_id == student)
                    & (StudentRepo.cw_id == project.coursework_id)
                )
            ).first()
            if db_exists:
                session.delete(db_exists)
                session.flush()

            db_student_repo = StudentRepo(
                student_id=student,
                repo_url=http_url_to_repo,
                cw_id=project.coursework_id,
                gl_repo_id=repo_id,
            )
            session.add(db_student_repo)
            created.append(student)

        except Exception:
            failed.append(student)
    session.commit()
    return {"created": created, "failed": failed}


@router.get("/{project_id}", response_model=ProjectRead)
async def get_specific_project(project_id: int):
    project = await gl_get_project(project_id)
    return project

@router.delete("/{project_id}", status_code=201)
async def delete_specific_project(project_id: int):
    return await gl_delete_project(project_id)


@router.get("/groups/{group_id}", response_model=ProjectsInCoursework)
async def get_projects(group_id: int):
    projects = await gl_get_projects(group_id)
    return ProjectsInCoursework(projects=projects)


@router.delete("/groups/{group_id}")
async def delete_projects(group_id: int):
    response = await gl_delete_projects(group_id)
    return response

# Do not use this route, use fork instead
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

## Misi deleted section of /create-fork

# # check whether any student repos already exist. if so bail out early
#     if session.exec(select(StudentRepo).where(StudentRepo.cw_id == project.coursework_id)).first():
#         raise HTTPException(
#             status_code=status.HTTP_409_CONFLICT,
#             detail="Some student repos have alrady been provisioned."
#         )

#     for student in students_enrolled:
#         try:
#             # Call helper function to create project
#             # create student_repo entry for each

#             data = await gl_create_fork(name, user_id=student, group_id=gitlab_id, template_id=project.template_id)
#             http_url_to_repo = data["http_url_to_repo"]

#             # we first check whether there is already a student repo db entry for this student
#             # if there is we delete it first

#             db_exists = session.exec(select(StudentRepo).where((StudentRepo.student_id == student) & (StudentRepo.cw_id == project.coursework_id))).first()
#             if db_exists:
#                 session.delete(db_exists)
#                 session.flush()

#             db_student_repo = StudentRepo(student_id=student, repo_url=http_url_to_repo, cw_id=project.coursework_id, gl_repo_id=data["id"])
#             session.add(db_student_repo)

#         except Exception:

#             raise HTTPException(
#                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#                 detail="Project for the student: " + student + " could not be created."
#             )
#     session.commit()
#     # Get the number of students enrolled onto a unit, by the courseworkid courseworkid -> unit -> unit_enrollement
#     # Make an API call to gitlab to create a project using a helper function for those many students
#     return {"unit id": students_enrolled}

@router.post(
    "/{project_id}/invites",
    response_model=ProjectInviteResult,
    status_code=status.HTTP_201_CREATED,
)
async def invite_user_to_project(project_id: int, invite: ProjectInviteCreate):
    return await gl_inv_add_user(
        user_emails=invite.user_emails,
        project_id=str(project_id),
        access_level=invite.access_level,
        expires_at=invite.expires_at,
    )


@router.post(
    "/invites/statuses",
    response_model=ProjectInviteStatusBatchResponse,
    status_code=status.HTTP_200_OK,
)
async def batch_get_invite_statuses(
    invite_statuses: ProjectInviteStatusBatchCreate,
):
    return await gl_inv_batch_get_statuses(targets=invite_statuses.targets)


@router.post(
    "/{project_id}/invites/list",
    response_model=ProjectInviteListResponse,
    status_code=status.HTTP_200_OK,
)
async def list_project_invites(project_id: int, invite_list: ProjectInviteList):
    return await gl_inv_list(project_id=str(project_id), email=invite_list.email)


@router.delete("/{project_id}/invites", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project_invite(project_id: int, invite: ProjectInviteDelete):
    result = await gl_inv_delete(
        user_email=invite.user_email,
        project_id=str(project_id),
    )
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
