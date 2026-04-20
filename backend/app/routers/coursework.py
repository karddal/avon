import datetime
import logging
import uuid
from typing import Annotated, Optional, Sequence
from uuid import UUID

import aioboto3
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.security import HTTPAuthorizationCredentials
from gitlab.exceptions import GitlabDeleteError, GitlabGetError
from sqlalchemy import and_, exists

# Adding this back in
from sqlalchemy.orm import selectinload, load_only
from sqlmodel import Session, select
from starlette.status import HTTP_404_NOT_FOUND
from types_aiobotocore_ecs.type_defs import RunTaskResponseTypeDef

# GitLab helpers
from app.core.gitlab import get_gitlab
from app.core.helpers.gitlab import (
    gitlab_project_path_from_repo_url,
    gl_activate_template_project,
    gl_create_coursework,
    gl_delete_coursework,
    gl_get_commit_count,
    gl_get_project_commits,
    gl_overwrite_zip,
    gl_template_files,
    gl_template_urls,
    gl_update_coursework,
    gl_upload_zip,
)
from app.core.scopes.scopes import (
    ResourceInformation,
    Scopes,
    authenticate_user,
    require_scopes,
)
from app.core.security import get_bearer, get_current_user_with_role
from app.core.settings import settings
from app.db.session import get_session
from app.models.base_image import BaseImage
from app.models.coursework import Coursework
from app.models.student_repo import StudentRepo
from app.models.test_run import TestRun, status_type, TestRunResult
from app.models.unit import Unit, UnitWithCourseworks
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.base_image import BaseImageList
from app.schemas.coursework import (
    CourseworkChangeStudentsRepo,
    CourseworkCreate,
    CourseworkDelete,
    CourseworkEngineData,
    CourseworkEventRead,
    CourseworkRead,
    CourseworkRepoCommit,
    CourseworkSetupProgress,
    CourseworkStudentRepoRead,
    CourseworkStudentRepos,
    CourseworkStudentWithRepos,
    CourseworkTemplateActivate,
    CourseworkTemplateExists,
    CourseworkTemplateFile,
    CourseworkTemplateUploadZip,
    CourseworkTemplateUrl,
    CourseworkUnitIdRead,
    CourseworkUpdate,
    CourseworkUpdateEngineData,
    CourseworkUpdateFormData,
    StudentWithMaybeRepo,
    CourseworkTestRuns,
    TestRunBasicInfo,
    TestRunFullInfo,
)
from app.schemas.security import CurrentUser
from app.schemas.test_run import StartTestRun
from app.schemas.unit import UnitStudents

logger = logging.getLogger("coursework")
router = APIRouter(prefix="/coursework", tags=["coursework"])
session_dependency = Annotated[Session, Depends(get_session)]
token_dependency = Annotated[HTTPAuthorizationCredentials, Depends(get_bearer)]


@router.get(
    "/{id}/test_run/{tid}",
    status_code=status.HTTP_200_OK,
    response_model=TestRunFullInfo,
)
async def get_test_run(
    id: UUID, tid: UUID, session: session_dependency, token: token_dependency
):
    coursework = session.get(Coursework, id)
    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )

    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_COURSEWORK_ENGINE,
        token=token,
        session=session,
    )

    test_run = session.get(TestRun, tid)

    if test_run is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Test run not found"
        )

    if test_run.coursework_id != coursework.id:
        # This user cannot access this test run, lecturers can only read test runs scoped to their own courseworks
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    # Check whether this test run has a result saved, if it is 'succeeded'
    # If so we generate an s3 pre-signed key and send it in the response
    maybe_r = session.get(TestRunResult, test_run.id)
    tester_exit_code = None
    log_name = None
    log_text = None
    if maybe_r is not None:
        # We have saved a result!
        tester_exit_code = maybe_r.exit_code
        if maybe_r.log_s3_uri is not None:
            # We have s3 bucket upload, so let's get a presigned key to respond with
            async with aioboto3.Session().client("s3") as s3:
                # url = await s3.generate_presigned_url(
                #     'get_object',
                #     Params={
                #         'Bucket': settings.aws_bucket,
                #         'Key': maybe_r.log_s3_uri
                #     },
                #     ExpiresIn=3600
                # )
                data = await s3.get_object(
                    Bucket=settings.aws_bucket, Key=maybe_r.log_s3_uri
                )
                body = data.get("Body")
                read = await body.read()
                log_name = maybe_r.log_s3_uri
                log_text = read.decode("utf-8")
    print(log_text)

    print(tester_exit_code)
    return TestRunFullInfo(
        id=test_run.id,
        coursework_id=test_run.coursework_id,
        ecs_task_arn=test_run.ecs_task_arn,
        gitlab_repo_id=test_run.gitlab_repo_id,
        git_url=test_run.git_url,
        task_def=test_run.task_def,
        tester_command=test_run.tester_command,
        status=test_run.status,
        completed_at=test_run.completed_at,
        trigger=test_run.trigger,
        created_at=test_run.created_at,
        notifications_enabled=test_run.notifications_enabled,
        started_by=test_run.started_by,
        batch_id=test_run.batch_id,
        tester_exit_code=tester_exit_code,
        log_name=log_name,
        log_text=log_text,
    )


@router.get("/{id}/test_runs", response_model=CourseworkTestRuns)
async def get_test_runs(id: UUID, session: session_dependency, token: token_dependency):
    coursework = session.get(Coursework, id)
    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )
    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_COURSEWORK_ENGINE,
        token=token,
        session=session,
    )
    result = []
    for tr in coursework.test_runs:
        students: Sequence[StudentRepo] = session.exec(
            select(StudentRepo)
            .options(load_only(StudentRepo.student_id))
            .where(
                (StudentRepo.cw_id == id)
                & (StudentRepo.gl_repo_id == tr.gitlab_repo_id)
            )
        ).all()
        student_ids: list[str] = list(map(lambda s: s.student_id, students))
        result.append(
            TestRunBasicInfo(
                id=tr.id,
                batch_id=tr.batch_id,
                started=tr.created_at,
                gitlab_repo_id=tr.gitlab_repo_id,
                gitlab_repo_url=tr.git_url,
                student_ids=student_ids,
                status=tr.status,
            )
        )

    return CourseworkTestRuns(
        test_runs=result,
    )


@router.post("/{id}/start_test_batch", status_code=status.HTTP_201_CREATED)
async def start_test_batch(
    id: UUID,
    request: StartTestRun,
    session: session_dependency,
    token: token_dependency,
):
    coursework = session.get(Coursework, id)
    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )
    user = await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_COURSEWORK_ENGINE,
        token=token,
        session=session,
    )

    # Now we have the coursework and we have checked that the user is logged in and has the right scopes

    if coursework.base_image_id is None or coursework.tester_command is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CW testing is not configured",
        )

    # Just a stub for now
    print("Testing started...")
    async with aioboto3.Session().client("ecs") as ecs:
        successful_starts = 0
        fails = 0
        gl = get_gitlab()
        batch_id = uuid.uuid4()

        if not settings.aws_results_queue_url:
            logger.error("AWS results queue url not configured!!")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if not settings.aws_ecs_cluster:
            logger.error("AWS ECS cluster name not configured!!")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

        for repo in request.repo_ids:
            test_run_id = uuid.uuid4()
            # Try and get the repo url from gitlab, if not present, bail out now
            try:
                repo_url = gl.projects.get(repo).http_url_to_repo

                t: RunTaskResponseTypeDef = await ecs.run_task(
                    taskDefinition=coursework.base_image.task_definition,
                    launchType="FARGATE",
                    cluster=settings.aws_ecs_cluster,
                    networkConfiguration={
                        "awsvpcConfiguration": {
                            "subnets": [
                                "subnet-09059c64b92caed30",
                                "subnet-030101770693225a8",
                            ],
                            "securityGroups": ["sg-0024f04dd642850d4"],
                            "assignPublicIp": "ENABLED",
                        }
                    },
                    overrides={
                        "containerOverrides": [
                            {
                                "name": "runner",
                                "environment": [
                                    {"name": "STUDENT_REPO", "value": repo_url},
                                    {
                                        "name": "RUN_COMMAND",
                                        "value": coursework.tester_command,
                                    },
                                    {"name": "BUILD_ID", "value": str(test_run_id)},
                                    {
                                        "name": "RESULT_QUEUE_URL",
                                        "value": settings.aws_results_queue_url,
                                    },
                                    {
                                        "name": "LOG_BUCKET",
                                        "value": settings.aws_bucket,
                                    },
                                    {"name": "RUN_TIMEOUT", "value": "300"},
                                ],
                            }
                        ]
                    },
                )
                arn = None
                if len(t["failures"]) > 0:
                    logger.error(
                        f"Failed to start aws task for {repo} on coursework {coursework}: {t['failures']}"
                    )
                    s: status_type = "failed"
                    fails += 1
                else:
                    s: status_type = "running"
                    arn = t["tasks"][0]["taskArn"]
                    successful_starts += 1
                    logger.debug(
                        f"Started test run for {repo} on coursework {coursework}"
                    )

                db_test_run = TestRun(
                    id=test_run_id,
                    coursework_id=coursework.id,
                    ecs_task_arn=arn,
                    gitlab_repo_id=repo,
                    git_url=repo_url,
                    task_def=coursework.base_image.task_definition,
                    tester_command=coursework.tester_command,
                    status=s,
                    completed_at=None,
                    trigger="initial",
                    started_by=user.user_id,
                    batch_id=batch_id,
                    notifications_enabled=request.notifications_enabled,
                )

                session.add(db_test_run)
                session.commit()
            except Exception as e:
                logger.error(
                    f"Failed to start test run for {repo} on coursework {coursework.id}: {e}"
                )
                session.rollback()
                fails += 1

        return {"started": successful_starts, "failed": fails}


@router.get("/{id}/student_repos", response_model=CourseworkStudentRepos)
async def get_student_repos(
    id: UUID, session: session_dependency, token: token_dependency
):
    coursework = session.get(Coursework, id)
    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )
    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_COURSEWORK_GITLAB,
        token=token,
        session=session,
    )

    repos = map(lambda sr: sr, coursework.student_repos)

    return CourseworkStudentRepos(repos=list(repos))


@router.get(
    "/{id}/addable_students_for_repo/{rid}",
    response_model=UnitStudents,
    status_code=status.HTTP_200_OK,
)
async def get_students(
    id: UUID, rid: str, session: session_dependency, token: token_dependency
):
    cw = session.get(Coursework, id)
    if cw is None:
        raise HTTPException(
            status_code=HTTP_404_NOT_FOUND, detail="Coursework not found"
        )

    await require_scopes(
        ResourceInformation(Unit, cw.unit_id),
        Scopes.UNIT_MANAGE,
        token=token,
        session=session,
    )

    studs = session.exec(
        select(StudentRepo.student_id).where(
            (StudentRepo.cw_id == id) & (StudentRepo.gl_repo_id != rid)
        )
    ).all()
    if not studs:
        raise HTTPException(status_code=404, detail="No students found.")
    print(studs)
    print("**************************************************")
    return UnitStudents(
        students=studs,
    )


@router.put("/{id}/change_repo_of/{sid}", response_model=StudentRepo)
async def change_repo_of(
    id: UUID,
    sid: str,
    information: CourseworkChangeStudentsRepo,
    session: session_dependency,
    token: token_dependency,
):
    coursework = session.get(Coursework, id)
    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coursework not found",
        )

    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_COURSEWORK_GITLAB,
        token=token,
        session=session,
    )

    gitlab = get_gitlab()

    student_repo_in_db = session.exec(
        select(StudentRepo).where(
            (StudentRepo.student_id == sid) & (StudentRepo.cw_id == id)
        )
    ).first()
    if not student_repo_in_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student repo not found",
        )

    repo_url = gitlab.projects.get(student_repo_in_db.gl_repo_id).http_url_to_repo

    student_repo_in_db.gl_repo_id = information.new_repo_id
    student_repo_in_db.repo_url = repo_url

    session.commit()
    session.refresh(student_repo_in_db)

    return student_repo_in_db


@router.delete("/{id}/del_repo/{rid}")
async def delete_repo(
    id: UUID, rid: str, session: session_dependency, token: token_dependency
):
    coursework = session.get(Coursework, id)
    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )
    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_COURSEWORK_GITLAB,
        token=token,
        session=session,
    )

    gitlab = get_gitlab()
    try:
        gitlab.projects.get(rid)

        gitlab.projects.delete(rid)
        # delete the student repos in session

        objects = session.exec(
            select(StudentRepo).where(
                (StudentRepo.cw_id == id) & (StudentRepo.gl_repo_id == rid)
            )
        ).all()
        for o in objects:
            session.delete(o)

        session.commit()
    except GitlabGetError:
        # couldn't get the project, probably user error
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="That id project doesnt exist.",
        )

    except GitlabDeleteError as e:
        return {"status": "error", "details": e}

    return {"status": "ok"}


@router.get("/{id}/all_students_with_repos", response_model=CourseworkStudentWithRepos)
async def get_all_students_with_repos(
    id: UUID, session: session_dependency, token: token_dependency
):
    """This function returns all students associated with the coursework, along with their repo URL if they have one."""
    coursework = session.get(Coursework, id)
    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )
    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_COURSEWORK_GITLAB,
        token=token,
        session=session,
    )

    students = list(
        map(
            lambda se: StudentWithMaybeRepo(id=se.user_id, repo_url=None, repo_id=None),
            filter(lambda x: x.type == "student", coursework.unit.enrollments),
        )
    )

    for s in students:
        # try and get the repo url
        repo = session.exec(
            select(StudentRepo).where(
                (StudentRepo.cw_id == coursework.id) & (StudentRepo.student_id == s.id)
            )
        ).first()

        if repo:
            s.repo_url = repo.repo_url
            s.repo_id = repo.gl_repo_id

    return CourseworkStudentWithRepos(students=students)


@router.get("/{id}/unit", response_model=CourseworkUnitIdRead)
async def get_coursework_unit_id(
    id: UUID, session: session_dependency, token: token_dependency
):
    coursework = session.get(Coursework, id)
    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )

    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_READ,
        token=token,
        session=session,
    )

    return CourseworkUnitIdRead(unit_id=coursework.unit_id)


@router.get("/{id}/my_repo", response_model=CourseworkStudentRepoRead)
async def get_my_student_repo(
    id: UUID,
    session: session_dependency,
    token: token_dependency,
    current_user: CurrentUser = Depends(get_current_user_with_role),
):
    coursework = session.get(Coursework, id)
    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )

    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_READ,
        token=token,
        session=session,
    )

    student_repo = session.exec(
        select(StudentRepo).where(
            StudentRepo.cw_id == id,
            StudentRepo.student_id == current_user.user_id,
        )
    ).first()

    if student_repo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student repository not found for this coursework",
        )

    if settings.testing_mode:
        commits = []
        total_commits = 0
    else:
        project_path = gitlab_project_path_from_repo_url(student_repo.repo_url)
        commit_data = await gl_get_project_commits(
            project_path,
            per_page=3,
        )
        if isinstance(commit_data, dict) and commit_data.get("success") is False:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to fetch GitLab commits",
            )
        if len(commit_data) > 0:
            count_data = await gl_get_commit_count(project_path, commit_data[0]["id"])
            if isinstance(count_data, dict) and count_data.get("success") is False:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Failed to fetch GitLab commit count",
                )
            total_commits = count_data.get("count", len(commit_data))
        else:
            total_commits = 0
        commits = [
            CourseworkRepoCommit(
                id=commit["id"],
                short_id=commit["short_id"],
                title=commit["title"],
                author_name=commit.get("author_name"),
                authored_date=commit.get("authored_date"),
                web_url=commit.get("web_url"),
                additions=commit.get("stats", {}).get("additions", 0),
                deletions=commit.get("stats", {}).get("deletions", 0),
            )
            for commit in commit_data
        ]

    return CourseworkStudentRepoRead(
        repo_url=student_repo.repo_url,
        commits=commits,
        total_commits=total_commits,
    )


@router.get(path="/{id}/available_images", response_model=BaseImageList)
async def get_base_images(
    id: UUID, session: session_dependency, token: token_dependency
):
    # this is a coursework route, so require engine role
    coursework = session.get(Coursework, id)
    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )
    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_COURSEWORK_ENGINE,
        token=token,
        session=session,
    )

    images = list(session.exec(select(BaseImage).where(BaseImage.is_active)).all())

    return BaseImageList(images=images)


@router.get(path="/{id}/engine_data", response_model=CourseworkEngineData)
async def get_engine_data(
    id: UUID, session: session_dependency, token: token_dependency
):
    # this is a coursework route, so require engine role
    coursework = session.get(Coursework, id)
    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )
    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_COURSEWORK_ENGINE,
        token=token,
        session=session,
    )

    print(f"SENDING CW ENGINE DATA, ID = {coursework.id}")
    return CourseworkEngineData(
        cw_id=coursework.id,
        base_image_id=coursework.base_image_id,
        tester_command=coursework.tester_command,
    )


@router.put("/{id}/update_engine", status_code=status.HTTP_200_OK)
async def update_engine_setup(
    id: UUID,
    cw: CourseworkUpdateEngineData,
    session: session_dependency,
    token: token_dependency,
):
    print(f"INCOMING ID: {id}")
    coursework = session.get(Coursework, id)
    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )
    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_COURSEWORK_ENGINE,
        token=token,
        session=session,
    )

    coursework.base_image_id = cw.base_image_id
    coursework.tester_command = cw.tester_command

    session.add(coursework)
    session.commit()
    session.refresh(coursework)
    return {"message": "Updated coursework engine"}


@router.post(
    "/create", response_model=CourseworkRead, status_code=status.HTTP_201_CREATED
)
async def create_coursework(
    coursework: CourseworkCreate, session: session_dependency, token: token_dependency
):
    courseworkAlreadyExists = session.exec(
        select(Coursework).where(
            (Coursework.unit_id == coursework.unit_id)
            & (Coursework.name == coursework.name)
            & (Coursework.due_date == coursework.due_date)
        )
    ).first()

    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_COURSEWORK_CREATE,
        token=token,
        session=session,
    )

    if courseworkAlreadyExists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coursework already made that belongs to the same unit and has the same name",
        )

    if coursework.unit_id is not None:
        unit_exists = session.exec(
            select(Unit).where(Unit.id == coursework.unit_id)
        ).first()
        if not unit_exists:
            raise HTTPException(status_code=404, detail="Corresponding unit not found")

    try:
        if settings.testing_mode:
            gl_data = {"gitlabGroupId": 12345678}
        else:
            gl_data = await gl_create_coursework(coursework.name, unit_exists.gitlab_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Database failed. GitLab group rolled back.",
        )

    db_coursework = Coursework(
        name=coursework.name,
        description=coursework.description,
        unit_id=coursework.unit_id,
        due_date=coursework.due_date,
        colour=coursework.colour,
        gitlab_id=gl_data["gitlabGroupId"],
        template_id=None,
        base_image_id=None,
        tester_command=None,
    )

    session.add(db_coursework)
    session.commit()
    session.refresh(db_coursework)
    return db_coursework


@router.get("/all")
async def all_courseworks(session: session_dependency, token: token_dependency):
    await require_scopes(
        ResourceInformation(type=Unit, id=None),
        Scopes.COURSEWORK_ALL,
        token=token,
        session=session,
    )
    statement = select(Unit).options(
        selectinload(Unit.courseworks),
        selectinload(Unit.programme),
    )

    units = session.exec(statement).all()

    results = [
        UnitWithCourseworks(
            id=unit.id,
            unit_code=unit.unit_code,
            name=unit.name,
            programme_start_date=unit.programme.start_date,
            programme_end_date=unit.programme.end_date,
            courseworks=unit.courseworks,
        ).model_dump()
        for unit in units
    ]

    return results


@router.get("/progress", response_model=list[CourseworkSetupProgress])
async def setup_progress(
    courseworkId: UUID, session: session_dependency, token: token_dependency
):
    coursework = session.get(Coursework, courseworkId)
    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )
    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_COURSEWORK_MANAGE,
        token=token,
        session=session,
    )
    if coursework.template_id:
        exists = True
    else:
        exists = False
    # When get other pices of info / steps are coed will put in here

    result = [
        {"title": "Create Template", "completed": exists},
        {"title": "Create Dockerfile", "completed": False},
        {"title": "Create Engine", "completed": False},
        {"title": "Test Engine", "completed": False},
        {"title": "Provision Repositories", "completed": False},
    ]
    return result


@router.get("/events", response_model=list[CourseworkEventRead])
async def list_coursework_events(
    session: session_dependency,
    token: token_dependency,
    from_: Optional[datetime.datetime] = None,
    to: Optional[datetime.datetime] = None,
    unit_ids: Optional[list[UUID]] = None,
    current_user: CurrentUser = Depends(get_current_user_with_role),
):
    statement = select(Coursework, Unit).join(Unit, Unit.id == Coursework.unit_id)

    if current_user.role != "admin":
        statement = statement.where(
            exists().where(
                and_(
                    UnitEnrollment.unit_id == Coursework.unit_id,
                    UnitEnrollment.user_id == current_user.user_id,
                )
            )
        )

    # TODO: currently useless code, I thought that we might need a function that can hide some coursework to student
    # enrollment_type = Optional[Literal["student", "lecturer"]] = None
    # if enrollment_type:
    #     statement = statement.where(UnitEnrollment.type == enrollment_type)

    if unit_ids:
        statement = statement.where(Coursework.unit_id.in_(unit_ids))
    if from_:
        statement = statement.where(Coursework.due_date >= from_)
    if to:
        statement = statement.where(Coursework.due_date < to)

    rows = session.exec(statement).all()

    return [
        {
            "id": coursework.id,
            "name": coursework.name,
            "due_date": coursework.due_date,
            "unit_id": str(unit.id),
            "unit_name": unit.name,
            "colour": coursework.colour,
        }
        for coursework, unit in rows
    ]


@router.get("/{id}/update_form_data", response_model=CourseworkUpdateFormData)
async def get_coursework_update_form_data(
    id: UUID, session: session_dependency, token: token_dependency
):
    coursework = session.get(Coursework, id)

    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="CW not found"
        )

    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_COURSEWORK_MANAGE,
        token=token,
        session=session,
    )

    unit = coursework.unit

    return CourseworkUpdateFormData(
        id=coursework.id,
        name=coursework.name,
        description=coursework.description,
        unit_id=unit.id,
        due_date=coursework.due_date,
        creation_date=coursework.creation_date,
        colour=coursework.colour,
        unit_name=unit.name,
        unit_code=unit.unit_code,
        gitlabId=coursework.gitlab_id,
        templateId=coursework.template_id,
        max_end_date=unit.programme.end_date,
    )


@router.get("/{id}/scopes")
async def get_coursework_scopes(
    id: UUID, session: session_dependency, token: token_dependency
):
    coursework = session.get(Coursework, id)

    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )

    user = await authenticate_user(
        resource=ResourceInformation(type=Unit, id=coursework.unit_id),
        token=token,
        session=session,
    )

    return {"scopes": [scope.value for scope in user.scopes]}


@router.get("/{id}", response_model=CourseworkRead)
async def get_coursework(
    id: UUID, session: session_dependency, token: token_dependency
):
    coursework = session.get(Coursework, id)

    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )

    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_READ,
        token=token,
        session=session,
    )

    return coursework


@router.delete("/{id}", response_model=CourseworkDelete)
async def delete_coursework(
    id: UUID, session: session_dependency, token: token_dependency
):
    coursework = session.get(Coursework, id)

    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )
    # print("\n\n\n\n\n\n\n")
    #
    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_COURSEWORK_DELETE,
        token=token,
        session=session,
    )
    session.delete(coursework)
    # cascade delete should make sure any entries in studentrepo should be deleted too

    try:
        if not settings.testing_mode:
            await gl_delete_coursework(coursework.gitlab_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Database failed. GitLab group rolled back.",
        )

    # print("got here")
    courseworkDeleted = CourseworkDelete(id=id, deletion_successful=True)
    # print(courseworkDeleted)
    session.commit()
    return courseworkDeleted


@router.put("/{id}", response_model=CourseworkRead)
async def update_coursework(
    id: UUID,
    coursework: CourseworkUpdate,
    session: session_dependency,
    token: token_dependency,
):
    coursework_db = session.get(Coursework, id)

    if coursework_db is None:
        raise HTTPException(status_code=404, detail="Coursework not found")

    await require_scopes(
        ResourceInformation(type=Unit, id=coursework_db.unit_id),
        Scopes.UNIT_COURSEWORK_MANAGE,
        token=token,
        session=session,
    )

    if coursework.unit_id is not None:
        unit_exists = session.exec(
            select(Unit).where(Unit.id == coursework.unit_id)
        ).first()
        if not unit_exists:
            raise HTTPException(status_code=404, detail="Corresponding unit not found")

    coursework_data = coursework.model_dump(exclude_unset=True)
    coursework_db.sqlmodel_update(coursework_data)

    try:
        if not settings.testing_mode:
            await gl_update_coursework(coursework_db.gitlab_id, coursework_db.name)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Database failed. GitLab group rolled back.",
        )

    session.add(coursework_db)
    session.commit()
    session.refresh(coursework_db)
    return coursework_db


@router.get("/{courseworkId}/template/exists", response_model=CourseworkTemplateExists)
async def template_exists(
    courseworkId: UUID, session: session_dependency, token: token_dependency
):
    coursework = session.get(Coursework, courseworkId)
    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )
    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_COURSEWORK_GITLAB,
        token=token,
        session=session,
    )

    if coursework.template_id:
        exists = True
        templateId = coursework.template_id
    else:
        exists = False
        templateId = None

    return {"exists": exists, "templateProjectId": templateId}


@router.post("/{cw_id}/template/activate", response_model=CourseworkTemplateActivate)
async def activate_template(
    cw_id: UUID, gitLabId: str, session: session_dependency, token: token_dependency
):
    try:
        templateActivation = await gl_activate_template_project(gitLabId)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GitLab request failed",
        )

    coursework = session.get(Coursework, cw_id)
    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )

    await require_scopes(
        ResourceInformation(type=Unit, id=coursework.unit_id),
        Scopes.UNIT_COURSEWORK_GITLAB,
        token=token,
        session=session,
    )

    coursework.template_id = templateActivation["templateGitLabId"]
    session.add(coursework)
    session.commit()
    session.refresh(coursework)

    return templateActivation


@router.get("/template/files", response_model=list[CourseworkTemplateFile])
async def get_files(
    templateId: str, session: session_dependency, token: token_dependency
):
    try:
        fileData = await gl_template_files(templateId)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GitLab request failed",
        )
    return fileData


@router.get("/template/urls", response_model=CourseworkTemplateUrl)
async def template_urls(
    templateId: str, session: session_dependency, token: token_dependency
):
    try:
        urlData = await gl_template_urls(templateId)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GitLab request failed",
        )
    return urlData


@router.post("/{cw_id}/template/upload-zip", response_model=CourseworkTemplateUploadZip)
async def upload_zip(
    cw_id: UUID,
    session: session_dependency,
    token: token_dependency,
    file: UploadFile = File(...),
):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="File must be in ZIP format")

    coursework = session.get(Coursework, cw_id)
    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )
    courseworkGitLabId = coursework.gitlab_id

    try:
        response = await gl_upload_zip(courseworkGitLabId, file)

    except HTTPException:
        raise  # Just gitalbs error message
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

    coursework = session.get(Coursework, cw_id)
    if coursework is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Coursework not found"
        )

    coursework.template_id = response["templateId"]
    session.add(coursework)
    session.commit()
    session.refresh(coursework)

    return response


@router.post("/template/overwrite-zip")
async def overwrite_zip(
    templateId: str, token: token_dependency, file: UploadFile = File(...)
):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="File must be in ZIP format")
    try:
        response = await gl_overwrite_zip(templateId, file)

    except HTTPException:
        raise  # Just gitalbs error message
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

    return response
