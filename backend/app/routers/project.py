
import random
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from datetime import datetime, timedelta
import asyncio

from app.db.session import engine

from app.core.helpers.gitlab import gl_create_fork, gl_create_project, gl_create_skeleton_code, gl_create_template_group, gl_create_template_project, gl_delete_project, gl_delete_projects, gl_get_project, gl_get_projects
from app.db.session import get_session
from app.models.coursework import Coursework
from app.models.projects import ProvisionProject
from app.core.helpers.gitlab import (
    gl_create_fork,
    gl_create_project,
    gl_create_skeleton_code,
    gl_create_template_group,
    gl_create_template_project,
    gl_delete_project,
    gl_delete_projects,
    gl_get_project,
    gl_get_projects,
)
from app.models.student_repo import StudentRepo
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.project import (
    CreateProjectForkForSpecificStudent,
    ProjectCreate,
    ProjectFork,
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

# A module-level flag to prevent duplicate workers
_worker_running = False

async def run_provision_worker():
    global _worker_running
    _worker_running = True
    try:
        while True:
            job_ids = []
            with Session(engine) as session:
                statement = select(ProvisionProject).where(
                    (ProvisionProject.status== "pending") &
                    (ProvisionProject.next_run_at <= datetime.now()) &
                    (ProvisionProject.attempts <= ProvisionProject.max_attempts)
                    ).limit(10)
                jobs = session.exec(statement).all()
                if not jobs:

                    # print("Nothing found in the jobs")
                    # return
                    await asyncio.sleep(1)
                    continue
                
                for job in jobs:
                    job.status = "in_progress"
                    job_ids.append(job.id)
                
                session.commit()

            await asyncio.gather(*(process_job(job_id) for job_id in job_ids))  
    
    finally:
        _worker_running = False

sem = asyncio.Semaphore(1)

async def process_job(job_id: int):
    switch = random.randint(0, 10)
    async with sem:
        with Session(engine) as session:
            job = session.get(ProvisionProject, job_id)
            print("job", job.student_id, "has failed")
            if switch == 5:
                try: 
                    data = await gl_create_fork(name=job.cw_name, user_id=job.student_id, group_id=job.gitlab_id, template_id=job.template_id)
                    http_url_to_repo = data["http_url_to_repo"]

                    db_exists = session.exec(select(StudentRepo).where((StudentRepo.student_id == job.student_id) & (StudentRepo.cw_id == job.cw_id))).first()
                    if db_exists:
                        session.delete(db_exists)
                        session.flush()

                    db_student_repo = StudentRepo(student_id=job.student_id, repo_url=http_url_to_repo, cw_id=job.cw_id, gl_repo_id=data["id"])
                    session.add(db_student_repo)
                    job.status = "success"
                    print(job.student_id, "has been successful")
                except Exception as e:
                    print("oops", e)
                    if job.attempts < job.max_attempts:
                        job.attempts += 1
                        backoff = 2 ** job.attempts
                        job.status = "pending"
                        job.next_run_at = datetime.now() + timedelta(seconds=backoff)
                        job.last_error = str(e)
                    else:
                        job.status = "failed"
                        job.last_error = str(e)
                        print("Failed", job.student_id)    
            else:    
                print(job.student_id, "is has failed. On attempt", job.attempts)
                if job.attempts < job.max_attempts:
                    job.attempts += 1
                    backoff = 2 ** job.attempts
                    job.status = "pending"
                    job.next_run_at = datetime.now() + timedelta(seconds=backoff)
                else:
                    job.status = "failed"
                    print("Failed", job.student_id) 
            session.commit()

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
        
        ## Part of Misi Code
        ## SEE end of file for deleted section.

    session.commit()
    print("done")

    if not _worker_running: 
        asyncio.create_task(run_provision_worker())
    print("done 1234")
    return {"queued": len(students_enrolled)}

@router.delete("/clear-queue")
async def clear_queue(session: session_dependency):
    statement = select(ProvisionProject)
    jobs = session.exec(statement).all()
    print(jobs)
    for job in jobs:
        session.delete(job)
    session.commit()
    statement = select(ProvisionProject)
    jobs = session.exec(statement).all()
    print("should be empty:")
    print(jobs)
    return {"all gone"}
  
@router.post("/create-fork-for-student", status_code=status.HTTP_201_CREATED)
async def create_fork_specific_student(project: CreateProjectForkForSpecificStudent, session: session_dependency):
    statement = select(Coursework.unit_id, Coursework.name, Coursework.gitlab_id).where(Coursework.id == project.coursework_id)
    cw_object = session.exec(statement).first()
    unit_id, name, gitlab_id = cw_object

    created = []
    failed = []
    # Get the student enrollment
    for student in project.student_ids:
        try:
            # Call helper function to create project
            # create student_repo entry for each

            # check whether student is actually enrolled in the unit
            if not session.exec(select(UnitEnrollment).where((UnitEnrollment.unit_id == unit_id) & (UnitEnrollment.user_id == student) & (UnitEnrollment.type == "student"))).first():
                return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Could not find that student")

            data = await gl_create_fork(name, user_id=student, group_id=gitlab_id, template_id=project.template_id)
            http_url_to_repo = data["http_url_to_repo"]
            repo_id = data["id"]

            # we first check whether there is already a student repo db entry for this student
            # if there is we delete it first

            db_exists = session.exec(select(StudentRepo).where((StudentRepo.student_id == student) & (StudentRepo.cw_id == project.coursework_id))).first()
            if db_exists:
                session.delete(db_exists)
                session.flush()

            db_student_repo = StudentRepo(student_id=student, repo_url=http_url_to_repo, cw_id=project.coursework_id, gl_repo_id=repo_id)
            session.add(db_student_repo)
            created.append(student)

        except Exception:
            # gitlab error occurred probably
            # we don't save that student as created.
            failed.append(student)
    session.commit()
    # Get the number of students enrolled onto a unit, by the courseworkid courseworkid -> unit -> unit_enrollement
    # Make an API call to gitlab to create a project using a helper function for those many students
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
    # Collect all the projects
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
