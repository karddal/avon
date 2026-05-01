import datetime
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from app.models.student_repo import StudentRepo
from app.models.test_run import TestRun
from app.routers import analytics
from app.schemas.security import CurrentUser
from tests.helpers.factories import create_coursework, create_students, create_unit


def add_test_run(
    session,
    coursework_id,
    *,
    repo_id="repo-1",
    status="succeeded",
    created_at=None,
):
    test_run = TestRun(
        coursework_id=coursework_id,
        ecs_task_arn="arn",
        gitlab_repo_id=repo_id,
        git_url="https://gitlab.example/group/repo.git",
        task_def="task",
        tester_command="pytest",
        status=status,
        trigger="initial",
        started_by="lecturer@example.com",
        batch_id=uuid4(),
        created_at=created_at or datetime.datetime.now(datetime.timezone.utc),
    )
    session.add(test_run)
    session.commit()
    return test_run


def test_analytics_helper_functions():
    assert analytics.repo_name_from_url("https://gitlab.example/group/repo.git") == "repo"
    assert analytics.repo_name_from_url("") == ""
    assert analytics.parse_gitlab_datetime(None) is None
    assert analytics.parse_gitlab_datetime("2026-04-29T10:00:00Z").tzinfo is not None
    assert analytics.normalize_pair(2, 4) == (50.0, 100.0)
    assert analytics.normalize_pair(0, 0) == (0.0, 0.0)


@pytest.mark.asyncio
async def test_commit_feed_returns_empty_in_testing_mode(session):
    result = await analytics.get_commit_feed(
        session,
        current_user=CurrentUser(user_id="admin", role="admin"),
    )

    assert result == []


@pytest.mark.asyncio
async def test_commit_feed_fetches_recent_commits_when_not_testing(session, monkeypatch):
    monkeypatch.setattr(analytics.settings, "app_env", "production")
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    session.add(
        StudentRepo(
            student_id="student@example.com",
            repo_url="https://gitlab.example/group/repo.git",
            gl_repo_id="repo-1",
            cw_id=coursework.id,
        )
    )
    session.commit()
    monkeypatch.setattr(
        analytics,
        "gl_get_project_commits",
        AsyncMock(
            return_value=[
                {
                    "id": "commit-1",
                    "short_id": "abc123",
                    "title": "Initial commit",
                    "author_name": "Student",
                    "authored_date": "2026-04-29T10:00:00Z",
                    "web_url": "https://gitlab.example/commit",
                    "stats": {"additions": 3, "deletions": 1},
                }
            ]
        ),
    )

    result = await analytics.get_commit_feed(
        session,
        current_user=CurrentUser(user_id="admin", role="admin"),
    )

    assert len(result) == 1
    assert result[0].repo_name == "repo"
    assert result[0].commit.additions == 3


@pytest.mark.asyncio
async def test_commit_feed_skips_gitlab_failures(session, monkeypatch):
    monkeypatch.setattr(analytics.settings, "app_env", "production")
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    session.add(
        StudentRepo(
            student_id="student@example.com",
            repo_url="https://gitlab.example/group/repo.git",
            gl_repo_id="repo-1",
            cw_id=coursework.id,
        )
    )
    session.commit()
    monkeypatch.setattr(
        analytics,
        "gl_get_project_commits",
        AsyncMock(return_value={"success": False, "error": "nope"}),
    )

    result = await analytics.get_commit_feed(
        session,
        current_user=CurrentUser(user_id="admin", role="admin"),
    )

    assert result == []


@pytest.mark.asyncio
async def test_test_run_feed_returns_recent_runs_with_student_ids(session):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    session.add(
        StudentRepo(
            student_id="student@example.com",
            repo_url="https://gitlab.example/group/repo.git",
            gl_repo_id="repo-1",
            cw_id=coursework.id,
        )
    )
    test_run = add_test_run(session, coursework.id, repo_id="repo-1")

    result = await analytics.get_test_run_feed(
        session,
        current_user=CurrentUser(user_id="admin", role="admin"),
    )

    assert len(result) == 1
    assert result[0].id == test_run.id
    assert result[0].student_ids == ["student@example.com"]


@pytest.mark.asyncio
async def test_test_run_feed_filters_non_admin_access(session):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    student = create_students(session, unit.id)
    add_test_run(session, coursework.id)

    visible = await analytics.get_test_run_feed(
        session,
        current_user=CurrentUser(user_id=student.user_id, role="student"),
    )
    hidden = await analytics.get_test_run_feed(
        session,
        current_user=CurrentUser(user_id="other@example.com", role="student"),
    )

    assert len(visible) == 1
    assert hidden == []


@pytest.mark.asyncio
async def test_test_run_status_summary_counts_statuses(session):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    for status in ["succeeded", "pending", "running", "failed", "error"]:
        add_test_run(session, coursework.id, status=status)

    summary = await analytics.get_test_run_status_summary(
        session,
        current_user=CurrentUser(user_id="admin", role="admin"),
    )

    assert summary.total_runs == 5
    assert summary.passed == 1
    assert summary.running == 2
    assert summary.failed == 1
    assert summary.errored == 1


@pytest.mark.asyncio
async def test_test_run_status_summary_returns_zeroes_without_accessible_coursework(session):
    summary = await analytics.get_test_run_status_summary(
        session,
        current_user=CurrentUser(user_id="admin", role="admin"),
    )

    assert summary.total_runs == 0
    assert summary.passed == 0


@pytest.mark.asyncio
async def test_activity_trend_counts_runs(session):
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    created_at = datetime.datetime(2026, 4, 29, 12, tzinfo=datetime.timezone.utc)
    add_test_run(session, coursework.id, created_at=created_at)

    trend = await analytics.get_activity_trend(
        session,
        from_date=datetime.date(2026, 4, 29),
        to_date=datetime.date(2026, 4, 29),
        current_user=CurrentUser(user_id="admin", role="admin"),
    )

    assert sum(point.runs for point in trend.points) == 1
    assert len(trend.points) == 16


@pytest.mark.asyncio
async def test_activity_trend_returns_empty_buckets_without_coursework(session):
    trend = await analytics.get_activity_trend(
        session,
        from_date=datetime.date(2026, 4, 29),
        to_date=datetime.date(2026, 4, 28),
        current_user=CurrentUser(user_id="admin", role="admin"),
    )

    assert len(trend.points) == 16
    assert sum(point.runs for point in trend.points) == 0


@pytest.mark.asyncio
async def test_coursework_comparison_returns_series_for_accessible_coursework(session):
    unit = create_unit(session)
    coursework_a = create_coursework(session, unit.id)
    coursework_b = create_coursework(session, unit.id)
    coursework_b.name = "Second coursework"
    session.add(coursework_b)
    session.add(
        StudentRepo(
            student_id="student-a@example.com",
            repo_url="https://gitlab.example/group/repo-a.git",
            gl_repo_id="repo-a",
            cw_id=coursework_a.id,
        )
    )
    session.add(
        StudentRepo(
            student_id="student-b@example.com",
            repo_url="https://gitlab.example/group/repo-b.git",
            gl_repo_id="repo-b",
            cw_id=coursework_b.id,
        )
    )
    add_test_run(session, coursework_a.id, repo_id="repo-a", status="succeeded")
    add_test_run(session, coursework_b.id, repo_id="repo-b", status="failed")

    comparison = await analytics.get_coursework_comparison(
        coursework_a.id,
        coursework_b.id,
        session,
        current_user=CurrentUser(user_id="admin", role="admin"),
    )

    assert [series.key for series in comparison.series] == [
        coursework_a.name,
        coursework_b.name,
    ]
    assert comparison.series[0].data[1].data == 100
    assert comparison.series[0].data[4].data == 100
    assert comparison.series[1].data[5].data == 0


@pytest.mark.asyncio
async def test_coursework_comparison_returns_empty_series_for_missing_coursework(session):
    comparison = await analytics.get_coursework_comparison(
        uuid4(),
        uuid4(),
        session,
        current_user=CurrentUser(user_id="admin", role="admin"),
    )

    assert comparison.series == []
