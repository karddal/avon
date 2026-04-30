import io
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from fastapi import HTTPException, UploadFile

from app.models.base_image import BaseImage
from app.models.student_repo import StudentRepo
from app.models.test_run import TestRun, TestRunResult
from app.models.unit_enrollment import UnitEnrollment
from app.routers import coursework as coursework_router
from app.schemas.coursework import (
    CourseworkChangeStudentsRepo,
    CourseworkUpdateEngineData,
)
from app.schemas.security import CurrentUser
from tests.helpers.factories import create_coursework, create_students, create_unit


@pytest.fixture
def token():
    return SimpleNamespace(credentials="token")


@pytest.fixture(autouse=True)
def allow_scope(monkeypatch):
    async def allowed(*args, **kwargs):
        return SimpleNamespace(user_id="lecturer@example.com", scopes=[])

    monkeypatch.setattr(coursework_router, "require_scopes", allowed)
    monkeypatch.setattr(coursework_router, "authenticate_user", allowed)


def add_test_run(session, coursework, *, repo_id="repo-1", result=False):
    test_run = TestRun(
        coursework_id=coursework.id,
        ecs_task_arn="arn",
        gitlab_repo_id=repo_id,
        git_url="https://gitlab.example/group/repo.git",
        task_def="task",
        tester_command="pytest",
        status="succeeded",
        completed_at=datetime.now(timezone.utc),
        trigger="initial",
        started_by="lecturer@example.com",
        batch_id=uuid4(),
    )
    session.add(test_run)
    session.commit()
    if result:
        session.add(
            TestRunResult(
                test_run_id=test_run.id,
                exit_code=0,
                log_s3_uri="logs/run.txt",
                received_at=datetime.now(timezone.utc),
            )
        )
        session.commit()
    return test_run


@pytest.mark.asyncio
async def test_get_test_run_returns_result_metadata(session, token, monkeypatch):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    test_run = add_test_run(session, coursework, result=True)

    class FakeBody:
        async def read(self):
            return b"test log"

    class FakeS3:
        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return None

        async def get_object(self, **kwargs):
            return {"Body": FakeBody()}

    class FakeSession:
        def client(self, service):
            return FakeS3()

    monkeypatch.setattr(coursework_router.aioboto3, "Session", FakeSession)

    result = await coursework_router.get_test_run(
        coursework.id,
        test_run.id,
        session,
        token,
    )

    assert result.id == test_run.id
    assert result.tester_exit_code == 0
    assert result.log_text == "test log"


@pytest.mark.asyncio
async def test_get_test_run_403s_for_other_coursework(session, token):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    other = create_coursework(session, unit.id)
    test_run = add_test_run(session, other)

    with pytest.raises(HTTPException) as exc:
        await coursework_router.get_test_run(coursework.id, test_run.id, session, token)

    assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_get_test_runs_includes_student_ids(session, token):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    add_test_run(session, coursework, repo_id="repo-1")
    session.add(
        StudentRepo(
            student_id="student@example.com",
            repo_url="https://gitlab/repo.git",
            gl_repo_id="repo-1",
            cw_id=coursework.id,
        )
    )
    session.commit()

    result = await coursework_router.get_test_runs(coursework.id, session, token)

    assert len(result.test_runs) == 1
    assert result.test_runs[0].student_ids == ["student@example.com"]


@pytest.mark.asyncio
async def test_student_repo_helpers(session, token, monkeypatch):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    create_students(session, unit.id)
    session.add(
        StudentRepo(
            student_id="student@example.com",
            repo_url="https://gitlab/repo.git",
            gl_repo_id="repo-1",
            cw_id=coursework.id,
        )
    )
    session.add(
        StudentRepo(
            student_id="other@example.com",
            repo_url="https://gitlab/other.git",
            gl_repo_id="repo-2",
            cw_id=coursework.id,
        )
    )
    session.commit()
    monkeypatch.setattr(
        coursework_router,
        "get_gitlab",
        lambda: SimpleNamespace(
            projects=SimpleNamespace(
                get=lambda repo_id: SimpleNamespace(http_url_to_repo=f"https://gitlab/{repo_id}.git")
            )
        ),
    )

    repos = await coursework_router.get_student_repos(coursework.id, session, token)
    addable = await coursework_router.get_students(coursework.id, "repo-1", session, token)
    changed = await coursework_router.change_repo_of(
        coursework.id,
        "student@example.com",
        CourseworkChangeStudentsRepo(new_repo_id="repo-3"),
        session,
        token,
    )
    all_students = await coursework_router.get_all_students_with_repos(
        coursework.id,
        session,
        token,
    )
    my_repo = await coursework_router.get_my_student_repo(
        coursework.id,
        session,
        token,
        CurrentUser(user_id="student@example.com", role="student"),
    )

    assert len(repos.repos) == 2
    assert addable.students == ["other@example.com"]
    assert changed.gl_repo_id == "repo-3"
    assert len(all_students.students) >= 1
    assert my_repo.repo_url == "https://gitlab/repo-1.git"


@pytest.mark.asyncio
async def test_delete_repo_removes_matching_student_repos(session, token, monkeypatch):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    session.add(
        StudentRepo(
            student_id="student@example.com",
            repo_url="https://gitlab/repo.git",
            gl_repo_id="repo-1",
            cw_id=coursework.id,
        )
    )
    session.commit()
    deleted = []
    monkeypatch.setattr(
        coursework_router,
        "get_gitlab",
        lambda: SimpleNamespace(
            projects=SimpleNamespace(
                get=lambda repo_id: SimpleNamespace(id=repo_id),
                delete=lambda repo_id: deleted.append(repo_id),
            )
        ),
    )

    assert await coursework_router.delete_repo(coursework.id, "repo-1", session, token) == {
        "status": "ok"
    }
    assert deleted == ["repo-1"]
    assert session.get(StudentRepo, ("student@example.com", coursework.id)) is None


@pytest.mark.asyncio
async def test_engine_and_base_image_helpers(session, token):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    active = BaseImage(name="Active", description="A", task_definition="task")
    inactive = BaseImage(
        name="Inactive",
        description="I",
        task_definition="task-2",
        is_active=False,
    )
    session.add(active)
    session.add(inactive)
    session.commit()

    images = await coursework_router.get_base_images(coursework.id, session, token)
    before = await coursework_router.get_engine_data(coursework.id, session, token)
    update_response = await coursework_router.update_engine_setup(
        coursework.id,
        CourseworkUpdateEngineData(
            cw_id=coursework.id,
            base_image_id=active.id,
            tester_command="pytest",
        ),
        session,
        token,
    )
    after = await coursework_router.get_engine_data(coursework.id, session, token)

    assert [image.name for image in images.images] == ["Active"]
    assert before.base_image_id is None
    assert update_response == {"message": "Updated coursework engine"}
    assert after.base_image_id == active.id
    assert after.tester_command == "pytest"


@pytest.mark.asyncio
async def test_coursework_unit_progress_events_and_scopes(session, token):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    coursework.template_id = 123
    coursework.due_date = datetime.now() + timedelta(days=7)
    session.add(coursework)
    session.commit()

    unit_id = await coursework_router.get_coursework_unit_id(
        coursework.id,
        session,
        token,
    )
    progress = await coursework_router.setup_progress(coursework.id, session, token)
    events = await coursework_router.list_coursework_events(
        session,
        token,
        current_user=CurrentUser(user_id="admin", role="admin"),
    )
    scopes = await coursework_router.get_coursework_scopes(coursework.id, session, token)

    assert unit_id.unit_id == unit.id
    assert progress[0]["completed"] is True
    assert events[0]["id"] == coursework.id
    assert scopes == {"scopes": []}


@pytest.mark.asyncio
async def test_template_helpers(session, token, monkeypatch):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    coursework.template_id = 123
    session.add(coursework)
    session.commit()
    monkeypatch.setattr(
        coursework_router,
        "gl_activate_template_project",
        AsyncMock(return_value={"templateGitLabId": 456}),
    )
    monkeypatch.setattr(
        coursework_router,
        "gl_template_files",
        AsyncMock(return_value=[{"path": "README.md", "type": "blob"}]),
    )
    monkeypatch.setattr(
        coursework_router,
        "gl_template_urls",
        AsyncMock(return_value={"http": "https://gitlab/repo.git", "ssh": "ssh"}),
    )
    monkeypatch.setattr(
        coursework_router,
        "gl_upload_zip",
        AsyncMock(return_value={"templateId": 789}),
    )
    monkeypatch.setattr(
        coursework_router,
        "gl_overwrite_zip",
        AsyncMock(return_value={"success": True}),
    )

    exists = await coursework_router.template_exists(coursework.id, session, token)
    activated = await coursework_router.activate_template(
        coursework.id,
        "123",
        session,
        token,
    )
    files = await coursework_router.get_files(456, session, token)
    urls = await coursework_router.template_urls(456, session, token)
    uploaded = await coursework_router.upload_zip(
        coursework.id,
        session,
        token,
        UploadFile(filename="template.zip", file=io.BytesIO(b"zip")),
    )
    overwritten = await coursework_router.overwrite_zip(
        789,
        session,
        token,
        UploadFile(filename="template.zip", file=io.BytesIO(b"zip")),
    )

    assert exists == {"exists": True, "templateProjectId": 123}
    assert activated == {"templateGitLabId": 456}
    assert files == [{"path": "README.md", "type": "blob"}]
    assert urls == {"http": "https://gitlab/repo.git", "ssh": "ssh"}
    assert uploaded == {"templateId": 789}
    assert overwritten == {"success": True}


@pytest.mark.asyncio
async def test_template_upload_rejects_non_zip(session, token):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)

    with pytest.raises(HTTPException) as exc:
        await coursework_router.upload_zip(
            coursework.id,
            session,
            token,
            UploadFile(filename="template.txt", file=io.BytesIO(b"text")),
        )

    assert exc.value.status_code == 400
