from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.models.projects import ProvisionBatch, ProvisionProject
from app.models.student_repo import StudentRepo
from app.models.unit_enrollment import UnitEnrollment
from app.routers import project as project_router
from app.schemas.project import (
    CreateProjectForkForSpecificStudent,
    ProjectCreate,
    ProjectFork,
    ProjectInviteCreate,
    ProjectInviteDelete,
    ProjectInviteList,
    ProjectInviteStatusBatchCreate,
    ProjectInviteStatusTarget,
    ProjectSkeleton,
    TemplateCreate,
)
from tests.helpers.factories import create_coursework, create_students, create_unit


@pytest.fixture
def token():
    return SimpleNamespace(credentials="token")


@pytest.mark.asyncio
async def test_project_health_check():
    assert await project_router.health_check() == {"health-check": "alive"}


@pytest.mark.asyncio
async def test_require_coursework_scope_404s_for_missing_coursework(session, token):
    with pytest.raises(HTTPException) as exc:
        await project_router.require_coursework_scope(
            uuid4(),
            project_router.Scopes.UNIT_COURSEWORK_GITLAB,
            session,
            token,
        )

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_require_project_scope_404s_for_missing_project(session, token):
    with pytest.raises(HTTPException) as exc:
        await project_router.require_project_scope(
            "missing",
            project_router.Scopes.UNIT_COURSEWORK_GITLAB,
            session,
            token,
        )

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_create_templates_success(session, token, monkeypatch):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    monkeypatch.setattr(project_router, "require_coursework_scope", AsyncMock(return_value=coursework))
    monkeypatch.setattr(
        project_router,
        "gl_create_template_group",
        AsyncMock(return_value={"gitlabGroupId": 42}),
    )
    monkeypatch.setattr(project_router, "gl_create_template_project", AsyncMock())

    response = await project_router.create_templates(
        TemplateCreate(coursework_id=coursework.id),
        session,
        token,
    )

    assert response == {"success": True}


@pytest.mark.asyncio
async def test_create_templates_handles_gitlab_group_failure(session, token, monkeypatch):
    monkeypatch.setattr(project_router, "require_coursework_scope", AsyncMock(return_value=SimpleNamespace(gitlab_id="1")))
    monkeypatch.setattr(
        project_router,
        "gl_create_template_group",
        AsyncMock(side_effect=RuntimeError("gitlab")),
    )

    with pytest.raises(HTTPException) as exc:
        await project_router.create_templates(
            TemplateCreate(coursework_id=uuid4()),
            session,
            token,
        )

    assert exc.value.status_code == 500


@pytest.mark.asyncio
async def test_create_skeleton_code_requires_admin_and_calls_gitlab(session, token, monkeypatch):
    monkeypatch.setattr(project_router, "require_role", AsyncMock())
    monkeypatch.setattr(
        project_router,
        "gl_create_skeleton_code",
        AsyncMock(return_value={"success": True}),
    )

    response = await project_router.create_skeleton_code(
        ProjectSkeleton(group_id=123, coursework_name="Coursework"),
        session,
        token,
    )

    assert response == {"success": True}


@pytest.mark.asyncio
async def test_create_fork_queues_only_unqueued_students(session, token, monkeypatch):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    student_one = create_students(session, unit.id)
    student_two = create_students(session, unit.id)
    existing_batch = ProvisionBatch(
        cw_id=coursework.id,
        total_jobs=1,
        completed=0,
        failed=0,
        status="running",
    )
    session.add(existing_batch)
    session.commit()
    session.add(
        ProvisionProject(
            batch_id=existing_batch.id,
            student_id=student_one.user_id,
            cw_id=coursework.id,
            cw_name=coursework.name,
            template_id=99,
            gitlab_id=int(coursework.gitlab_id),
        )
    )
    session.commit()
    monkeypatch.setattr(project_router, "require_coursework_scope", AsyncMock(return_value=coursework))

    response = await project_router.create_fork(
        ProjectFork(name="Coursework", coursework_id=coursework.id, template_id="99"),
        session,
        token,
    )

    new_batch = session.get(ProvisionBatch, response["batch_id"])
    assert new_batch.total_jobs == 1
    queued_students = [job.student_id for job in session.exec(project_router.select(ProvisionProject)).all()]
    assert student_two.user_id in queued_students


@pytest.mark.asyncio
async def test_get_batch_status_returns_batch_counts(session, token, monkeypatch):
    batch = ProvisionBatch(
        cw_id=uuid4(),
        total_jobs=3,
        completed=2,
        failed=1,
        status="running",
    )
    session.add(batch)
    session.commit()
    monkeypatch.setattr(project_router, "require_coursework_scope", AsyncMock())

    response = await project_router.get_batch_status(batch.id, session, token)

    assert response == {
        "total": 3,
        "completed": 2,
        "failed": 1,
        "status": "running",
    }


@pytest.mark.asyncio
async def test_get_batch_status_404s_for_missing_batch(session, token):
    with pytest.raises(HTTPException) as exc:
        await project_router.get_batch_status(uuid4(), session, token)

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_clear_queue_removes_jobs_and_batches(session, token, monkeypatch):
    monkeypatch.setattr(project_router, "require_role", AsyncMock())
    batch = ProvisionBatch(
        cw_id=uuid4(),
        total_jobs=1,
        completed=0,
        failed=0,
        status="running",
    )
    session.add(batch)
    session.commit()
    session.add(
        ProvisionProject(
            batch_id=batch.id,
            student_id="student@example.com",
            cw_id=batch.cw_id,
            cw_name="Coursework",
            template_id=1,
            gitlab_id=2,
        )
    )
    session.commit()

    assert await project_router.clear_queue(session, token) == {"all gone"}
    assert session.exec(project_router.select(ProvisionProject)).all() == []
    assert session.exec(project_router.select(ProvisionBatch)).all() == []


@pytest.mark.asyncio
async def test_create_fork_specific_student_creates_repos(session, token, monkeypatch):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    student = create_students(session, unit.id)
    monkeypatch.setattr(project_router, "require_coursework_scope", AsyncMock(return_value=coursework))
    monkeypatch.setattr(
        project_router,
        "gl_create_fork",
        AsyncMock(return_value={"http_url_to_repo": "https://gitlab/repo", "id": 123}),
    )

    response = await project_router.create_fork_specific_student(
        CreateProjectForkForSpecificStudent(
            name="Coursework",
            coursework_id=coursework.id,
            template_id="99",
            student_ids=[student.user_id],
        ),
        session,
        token,
    )

    assert response == {"created": [student.user_id], "failed": []}
    repo = session.get(StudentRepo, (student.user_id, coursework.id))
    assert repo.repo_url == "https://gitlab/repo"


@pytest.mark.asyncio
async def test_create_fork_specific_student_returns_404_for_non_student(session, token, monkeypatch):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    monkeypatch.setattr(project_router, "require_coursework_scope", AsyncMock(return_value=coursework))

    response = await project_router.create_fork_specific_student(
        CreateProjectForkForSpecificStudent(
            name="Coursework",
            coursework_id=coursework.id,
            template_id="99",
            student_ids=["missing@example.com"],
        ),
        session,
        token,
    )

    assert isinstance(response, HTTPException)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_admin_project_gitlab_routes(session, token, monkeypatch):
    monkeypatch.setattr(project_router, "require_role", AsyncMock())
    monkeypatch.setattr(project_router, "gl_get_project", AsyncMock(return_value={"id": 1, "name": "p", "path": "p", "web_url": "url"}))
    monkeypatch.setattr(project_router, "gl_delete_project", AsyncMock(return_value={"deleted": True}))
    monkeypatch.setattr(project_router, "gl_get_projects", AsyncMock(return_value=[]))
    monkeypatch.setattr(project_router, "gl_delete_projects", AsyncMock(return_value={"deleted": True}))

    assert await project_router.get_specific_project(1, session, token) == {
        "id": 1,
        "name": "p",
        "path": "p",
        "web_url": "url",
    }
    assert await project_router.delete_specific_project(1, session, token) == {"deleted": True}
    projects = await project_router.get_projects(1, session, token)
    assert projects.projects == []
    assert await project_router.delete_projects(1, session, token) == {"deleted": True}


@pytest.mark.asyncio
async def test_create_projects_calls_gitlab_for_enrolled_students(session, token, monkeypatch):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    student = create_students(session, unit.id)
    create_mock = AsyncMock()
    monkeypatch.setattr(project_router, "require_coursework_scope", AsyncMock(return_value=coursework))
    monkeypatch.setattr(project_router, "gl_create_project", create_mock)

    response = await project_router.create_projects(
        ProjectCreate(
            name="Coursework",
            coursework_id=coursework.id,
            template_group_id=1,
            template_id=2,
        ),
        session,
        token,
    )

    assert response == {"unit id": [student.user_id]}
    create_mock.assert_awaited_once()


@pytest.mark.asyncio
async def test_invite_routes_delegate_to_gitlab(session, token, monkeypatch):
    coursework_id = uuid4()
    session.add(
        StudentRepo(
            student_id="student@example.com",
            repo_url="https://gitlab/repo",
            cw_id=coursework_id,
            gl_repo_id="123",
        )
    )
    session.commit()
    monkeypatch.setattr(project_router, "require_project_scope", AsyncMock())
    monkeypatch.setattr(project_router, "gl_inv_add_user", AsyncMock(return_value={"success": True, "error": None}))
    monkeypatch.setattr(project_router, "gl_inv_batch_get_statuses", AsyncMock(return_value={"success": True, "data": []}))
    monkeypatch.setattr(project_router, "gl_inv_list", AsyncMock(return_value={"success": True, "data": []}))
    monkeypatch.setattr(project_router, "gl_inv_delete", AsyncMock(return_value=SimpleNamespace(success=True, error=None)))

    assert await project_router.invite_user_to_project(
        123,
        ProjectInviteCreate(user_emails=["a@example.com"]),
        session,
        token,
    ) == {"success": True, "error": None}
    assert await project_router.batch_get_invite_statuses(
        ProjectInviteStatusBatchCreate(
            targets=[
                ProjectInviteStatusTarget(project_id="123", user_email=" A@EXAMPLE.COM "),
                ProjectInviteStatusTarget(project_id="123", user_email="a@example.com"),
            ]
        ),
        session,
        token,
    ) == {"success": True, "data": []}
    assert await project_router.list_project_invites(
        123,
        ProjectInviteList(email="a@example.com"),
        session,
        token,
    ) == {"success": True, "data": []}
    response = await project_router.delete_project_invite(
        123,
        ProjectInviteDelete(user_email="a@example.com"),
        session,
        token,
    )
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_delete_project_invite_400s_when_gitlab_delete_fails(session, token, monkeypatch):
    monkeypatch.setattr(project_router, "require_project_scope", AsyncMock())
    monkeypatch.setattr(
        project_router,
        "gl_inv_delete",
        AsyncMock(return_value=SimpleNamespace(success=False, error="nope")),
    )

    with pytest.raises(HTTPException) as exc:
        await project_router.delete_project_invite(
            123,
            ProjectInviteDelete(user_email="a@example.com"),
            session,
            token,
        )

    assert exc.value.status_code == 400
