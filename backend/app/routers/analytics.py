import asyncio
import datetime
import logging
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload

from app.core.helpers.gitlab import (
    gitlab_project_path_from_repo_url,
    gl_get_project_commits,
)
from app.core.security import get_current_user_with_role
from app.core.settings import settings
from app.db.session import get_session
from app.models.coursework import Coursework
from app.models.student_repo import StudentRepo
from app.models.test_run import TestRun
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.coursework import (
    CourseworkActivityTrendPoint,
    CourseworkComparisonMetric,
    CourseworkComparisonSeries,
    CourseworkComparisonSummary,
    CourseworkActivityTrendSummary,
    CourseworkCommitFeedItem,
    CourseworkRepoCommit,
    CourseworkTestRunFeedItem,
    CourseworkTestRunStatusSummary,
)
from app.schemas.security import CurrentUser

logger = logging.getLogger("analytics")
router = APIRouter(prefix="/analytics", tags=["analytics"])
session_dependency = Annotated[Session, Depends(get_session)]


def repo_name_from_url(repo_url: str) -> str:
    trimmed = repo_url.rstrip("/")
    if trimmed.endswith(".git"):
        trimmed = trimmed[:-4]
    return trimmed.split("/")[-1] if trimmed else repo_url


def _accessible_coursework_statement_for_user(current_user: CurrentUser):
    coursework_statement = select(Coursework)

    if not current_user.is_admin:
        coursework_statement = coursework_statement.join(
            UnitEnrollment,
            UnitEnrollment.unit_id == Coursework.unit_id,
        ).where(
            UnitEnrollment.user_id == current_user.user_id,
        )

    return coursework_statement


def _start_of_day_utc(value: datetime.date) -> datetime.datetime:
    return datetime.datetime.combine(
        value,
        datetime.time.min,
        tzinfo=datetime.timezone.utc,
    )


def parse_gitlab_datetime(value: str | None) -> datetime.datetime | None:
    if value is None:
        return None

    normalized = value.replace("Z", "+00:00")
    parsed = datetime.datetime.fromisoformat(normalized)
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=datetime.timezone.utc)

    return parsed.astimezone(datetime.timezone.utc)


def normalize_pair(first: int, second: int) -> tuple[float, float]:
    ceiling = max(first, second, 1)
    return (first / ceiling) * 100, (second / ceiling) * 100


@router.get("/commit_feed", response_model=list[CourseworkCommitFeedItem])
async def get_commit_feed(
    session: session_dependency,
    per_repo: int = 5,
    limit: int = 40,
    unit_id: UUID | None = None,
    coursework_id: UUID | None = None,
    current_user: CurrentUser = Depends(get_current_user_with_role),
):
    if settings.testing_mode:
        return []

    # Only consider commits form last day, to keep the feed fresh and limit the amount of data we need to fetch from GitLab
    now = datetime.datetime.now(datetime.timezone.utc)
    recent_cutoff = now - datetime.timedelta(days=1)
    recent_cutoff_iso = recent_cutoff.isoformat().replace("+00:00", "Z")

    # Fetch all accessable coursework IDs for that logged in user
    coursework_statement = _accessible_coursework_statement_for_user(
        current_user
    ).options(selectinload(Coursework.student_repos))

    # Don't consideer courseworks that have already fininshed
    coursework_statement = coursework_statement.where(
        Coursework.due_date >= datetime.datetime.now()
    )

    # Filterring by unit and coursework for the UI controls
    if unit_id is not None:
        coursework_statement = coursework_statement.where(Coursework.unit_id == unit_id)
    if coursework_id is not None:
        coursework_statement = coursework_statement.where(Coursework.id == coursework_id)

    # Get the acual courseworks that we have access to, and their student repos
    accessible_courseworks = session.exec(coursework_statement).unique().all()
    if not accessible_courseworks:
        return []

    # Build a list of (coursework, student_repo) tuples for all repos we need to fetch commits for
    repo_targets: list[tuple[Coursework, StudentRepo]] = []
    for coursework in accessible_courseworks:
        for student_repo in coursework.student_repos:
            repo_targets.append((coursework, student_repo))

    if not repo_targets:
        return []

    # use smarphone to limit gitlab requests to only 8 at a time
    semaphore = asyncio.Semaphore(8)

    async def fetch_repo_commits(coursework: Coursework, student_repo: StudentRepo):
        if not student_repo.repo_url:
            return []

        project_path = gitlab_project_path_from_repo_url(student_repo.repo_url)
        repo_url = student_repo.repo_url
        repo_name = repo_name_from_url(repo_url)

        try:
            async with semaphore:
                commit_data = await gl_get_project_commits(
                    project_path,
                    per_page=per_repo,
                    since=recent_cutoff_iso,
                )
        except Exception as error:
            logger.warning(
                "Skipping commit feed for coursework %s repo %s after request failure: %r",
                coursework.id,
                student_repo.gl_repo_id,
                error,
            )
            return []

        if isinstance(commit_data, dict) and commit_data.get("success") is False:
            logger.warning(
                "Skipping commit feed for coursework %s repo %s: %s",
                coursework.id,
                student_repo.gl_repo_id,
                commit_data.get("error"),
            )
            return []

        return [
            CourseworkCommitFeedItem(
                repo_id=student_repo.gl_repo_id,
                repo_url=repo_url,
                repo_name=repo_name,
                coursework_id=str(coursework.id),
                coursework_name=coursework.name,
                student_ids=[student_repo.student_id],
                commit=CourseworkRepoCommit(
                    id=commit["id"],
                    short_id=commit["short_id"],
                    title=commit["title"],
                    author_name=commit.get("author_name"),
                    authored_date=commit.get("authored_date"),
                    web_url=commit.get("web_url"),
                    additions=commit.get("stats", {}).get("additions", 0),
                    deletions=commit.get("stats", {}).get("deletions", 0),
                ),
            )
            for commit in commit_data
        ]

    # Fetch commits for all repos concurrently, but limited by the semaphore to avoid overwhelming GitLab or our server
    commit_lists = await asyncio.gather(
        *(fetch_repo_commits(coursework, student_repo) for coursework, student_repo in repo_targets)
    )
    flattened = [item for repo_commits in commit_lists for item in repo_commits]
    flattened.sort(
        key=lambda item: item.commit.authored_date or datetime.datetime.min,
        reverse=True,
    )
    return flattened[:limit]


@router.get("/test_run_feed", response_model=list[CourseworkTestRunFeedItem])
async def get_test_run_feed(
    session: session_dependency,
    limit: int = 40,
    unit_id: UUID | None = None,
    coursework_id: UUID | None = None,
    current_user: CurrentUser = Depends(get_current_user_with_role),
):
    now = datetime.datetime.now(datetime.timezone.utc)

    coursework_statement = _accessible_coursework_statement_for_user(current_user)
    if unit_id is not None:
        coursework_statement = coursework_statement.where(Coursework.unit_id == unit_id)
    if coursework_id is not None:
        coursework_statement = coursework_statement.where(Coursework.id == coursework_id)

    accessible_courseworks = session.exec(coursework_statement).unique().all()
    if not accessible_courseworks:
        return []

    coursework_by_id = {
        coursework.id: coursework for coursework in accessible_courseworks
    }
    coursework_ids = list(coursework_by_id.keys())
    cutoff = now - datetime.timedelta(days=1)

    test_runs = session.exec(
        select(TestRun)
        .where(TestRun.coursework_id.in_(coursework_ids))
        .where(TestRun.created_at >= cutoff)
        .order_by(TestRun.created_at.desc())
        .limit(limit)
    ).all()

    if not test_runs:
        return []

    student_repo_rows = session.exec(
        select(StudentRepo).where(StudentRepo.cw_id.in_(coursework_ids))
    ).all()
    student_ids_by_repo: dict[tuple[UUID, str], list[str]] = {}
    for student_repo in student_repo_rows:
        key = (student_repo.cw_id, student_repo.gl_repo_id)
        student_ids_by_repo.setdefault(key, []).append(student_repo.student_id)

    result = [
        CourseworkTestRunFeedItem(
            id=test_run.id,
            coursework_id=test_run.coursework_id,
            coursework_name=coursework_by_id[test_run.coursework_id].name,
            gitlab_repo_id=test_run.gitlab_repo_id,
            gitlab_repo_url=test_run.git_url,
            student_ids=student_ids_by_repo.get(
                (test_run.coursework_id, test_run.gitlab_repo_id),
                [],
            ),
            status=test_run.status,
            trigger=test_run.trigger,
            started_by=test_run.started_by,
            created_at=test_run.created_at,
            completed_at=test_run.completed_at,
            batch_id=test_run.batch_id,
        )
        for test_run in test_runs
    ]

    return result


@router.get(
    "/test_run_status_summary",
    response_model=CourseworkTestRunStatusSummary,
)
async def get_test_run_status_summary(
    session: session_dependency,
    from_date: datetime.date | None = None,
    unit_id: UUID | None = None,
    coursework_id: UUID | None = None,
    current_user: CurrentUser = Depends(get_current_user_with_role),
):
    now = datetime.datetime.now(datetime.timezone.utc)
    cutoff = (
        _start_of_day_utc(from_date)
        if from_date is not None
        else now - datetime.timedelta(days=7)
    )

    coursework_statement = _accessible_coursework_statement_for_user(current_user)
    if unit_id is not None:
        coursework_statement = coursework_statement.where(Coursework.unit_id == unit_id)
    if coursework_id is not None:
        coursework_statement = coursework_statement.where(Coursework.id == coursework_id)

    accessible_courseworks = session.exec(coursework_statement).unique().all()
    if not accessible_courseworks:
        return CourseworkTestRunStatusSummary(
            from_date=cutoff,
            total_runs=0,
            passed=0,
            running=0,
            failed=0,
            errored=0,
        )

    coursework_ids = [coursework.id for coursework in accessible_courseworks]
    test_runs = session.exec(
        select(TestRun)
        .where(TestRun.coursework_id.in_(coursework_ids))
        .where(TestRun.created_at >= cutoff)
    ).all()

    passed = 0
    running = 0
    failed = 0
    errored = 0

    for test_run in test_runs:
        if test_run.status == "succeeded":
            passed += 1
        elif test_run.status in {"pending", "running"}:
            running += 1
        elif test_run.status == "failed":
            failed += 1
        elif test_run.status == "error":
            errored += 1

    return CourseworkTestRunStatusSummary(
        from_date=cutoff,
        total_runs=len(test_runs),
        passed=passed,
        running=running,
        failed=failed,
        errored=errored,
    )


@router.get(
    "/activity_trend",
    response_model=CourseworkActivityTrendSummary,
)
async def get_activity_trend(
    session: session_dependency,
    from_date: datetime.date | None = None,
    to_date: datetime.date | None = None,
    unit_id: UUID | None = None,
    coursework_id: UUID | None = None,
    current_user: CurrentUser = Depends(get_current_user_with_role),
):
    now = datetime.datetime.now(datetime.timezone.utc)
    target_point_count = 16

    range_start = (
        _start_of_day_utc(from_date)
        if from_date is not None
        else _start_of_day_utc((now - datetime.timedelta(days=1)).date())
    )
    range_end = (
        _start_of_day_utc(to_date + datetime.timedelta(days=1))
        if to_date is not None
        else now
    )

    if range_end <= range_start:
        range_end = range_start + datetime.timedelta(days=1)

    total_hours = max((range_end - range_start).total_seconds() / 3600, 1)
    bucket_hours = total_hours / target_point_count

    coursework_statement = _accessible_coursework_statement_for_user(
        current_user
    ).options(selectinload(Coursework.student_repos))
    if unit_id is not None:
        coursework_statement = coursework_statement.where(Coursework.unit_id == unit_id)
    if coursework_id is not None:
        coursework_statement = coursework_statement.where(Coursework.id == coursework_id)

    accessible_courseworks = session.exec(coursework_statement).unique().all()

    bucket_count = max(
        1,
        target_point_count,
    )
    buckets = [
        {
            "start": range_start + datetime.timedelta(hours=index * bucket_hours),
            "commits": 0,
            "runs": 0,
        }
        for index in range(bucket_count)
    ]

    if not accessible_courseworks:
        return CourseworkActivityTrendSummary(
            from_date=range_start,
            to_date=range_end,
            bucket_hours=bucket_hours,
            points=[
                CourseworkActivityTrendPoint(
                    slot=bucket["start"].strftime("%d %b %H:%M"),
                    commits=bucket["commits"],
                    runs=bucket["runs"],
                )
                for bucket in buckets
            ],
        )

    coursework_ids = [coursework.id for coursework in accessible_courseworks]
    repo_targets: list[StudentRepo] = []
    for coursework in accessible_courseworks:
        repo_targets.extend(coursework.student_repos)

    if not settings.testing_mode and repo_targets:
        semaphore = asyncio.Semaphore(8)
        since_iso = range_start.isoformat().replace("+00:00", "Z")

        async def fetch_repo_commits(student_repo: StudentRepo):
            if not student_repo.repo_url:
                return []

            project_path = gitlab_project_path_from_repo_url(student_repo.repo_url)

            try:
                async with semaphore:
                    commit_data = await gl_get_project_commits(
                        project_path,
                        per_page=100,
                        since=since_iso,
                    )
            except Exception as error:
                logger.warning(
                    "Skipping trend commits for repo %s after request failure: %r",
                    student_repo.gl_repo_id,
                    error,
                )
                return []

            if isinstance(commit_data, dict) and commit_data.get("success") is False:
                logger.warning(
                    "Skipping trend commits for repo %s: %s",
                    student_repo.gl_repo_id,
                    commit_data.get("error"),
                )
                return []

            return commit_data

        commit_lists = await asyncio.gather(
            *(fetch_repo_commits(student_repo) for student_repo in repo_targets)
        )

        for repo_commits in commit_lists:
            for commit in repo_commits:
                authored_at = parse_gitlab_datetime(commit.get("authored_date"))
                if authored_at is None or not (range_start <= authored_at < range_end):
                    continue

                bucket_index = int(
                    (authored_at - range_start).total_seconds() // (bucket_hours * 3600)
                )
                bucket_index = min(bucket_index, len(buckets) - 1)
                if bucket_index >= 0:
                    buckets[bucket_index]["commits"] += 1

    test_runs = session.exec(
        select(TestRun)
        .where(TestRun.coursework_id.in_(coursework_ids))
        .where(TestRun.created_at >= range_start)
        .where(TestRun.created_at < range_end)
    ).all()

    for test_run in test_runs:
        created_at = test_run.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=datetime.timezone.utc)
        else:
            created_at = created_at.astimezone(datetime.timezone.utc)

        bucket_index = int(
            (created_at - range_start).total_seconds() // (bucket_hours * 3600)
        )
        bucket_index = min(bucket_index, len(buckets) - 1)
        if bucket_index >= 0:
            buckets[bucket_index]["runs"] += 1

    return CourseworkActivityTrendSummary(
        from_date=range_start,
        to_date=range_end,
        bucket_hours=bucket_hours,
        points=[
            CourseworkActivityTrendPoint(
                slot=bucket["start"].strftime("%d %b %H:%M"),
                commits=bucket["commits"],
                runs=bucket["runs"],
            )
            for bucket in buckets
        ],
    )


@router.get(
    "/coursework_comparison",
    response_model=CourseworkComparisonSummary,
)
async def get_coursework_comparison(
    coursework_a_id: UUID,
    coursework_b_id: UUID,
    session: session_dependency,
    from_date: datetime.date | None = None,
    current_user: CurrentUser = Depends(get_current_user_with_role),
):
    cutoff = (
        _start_of_day_utc(from_date)
        if from_date is not None
        else datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=7)
    )

    accessible_courseworks = session.exec(
        _accessible_coursework_statement_for_user(current_user)
        .options(selectinload(Coursework.student_repos))
        .where(Coursework.id.in_([coursework_a_id, coursework_b_id]))
    ).unique().all()
    coursework_by_id = {coursework.id: coursework for coursework in accessible_courseworks}

    if coursework_a_id not in coursework_by_id or coursework_b_id not in coursework_by_id:
        return CourseworkComparisonSummary(from_date=cutoff, series=[])

    async def summarize_coursework(coursework: Coursework):
        unique_repos = {
            repo.gl_repo_id: repo
            for repo in coursework.student_repos
            if repo.repo_url and repo.gl_repo_id
        }

        commit_count = 0
        active_repo_ids: set[str] = set()

        if not settings.testing_mode and unique_repos:
            since_iso = cutoff.isoformat().replace("+00:00", "Z")
            semaphore = asyncio.Semaphore(8)

            async def fetch_repo_commits(student_repo: StudentRepo):
                project_path = gitlab_project_path_from_repo_url(student_repo.repo_url)
                try:
                    async with semaphore:
                        commit_data = await gl_get_project_commits(
                            project_path,
                            per_page=100,
                            since=since_iso,
                        )
                except Exception as error:
                    logger.warning(
                        "Skipping coursework comparison commits for repo %s after request failure: %r",
                        student_repo.gl_repo_id,
                        error,
                    )
                    return student_repo.gl_repo_id, []

                if isinstance(commit_data, dict) and commit_data.get("success") is False:
                    logger.warning(
                        "Skipping coursework comparison commits for repo %s: %s",
                        student_repo.gl_repo_id,
                        commit_data.get("error"),
                    )
                    return student_repo.gl_repo_id, []

                return student_repo.gl_repo_id, commit_data

            commit_lists = await asyncio.gather(
                *(fetch_repo_commits(repo) for repo in unique_repos.values())
            )

            for repo_id, commits in commit_lists:
                in_range_commits = [
                    commit
                    for commit in commits
                    if (authored_at := parse_gitlab_datetime(commit.get("authored_date")))
                    and authored_at >= cutoff
                ]
                commit_count += len(in_range_commits)
                if in_range_commits:
                    active_repo_ids.add(repo_id)

        test_runs = session.exec(
            select(TestRun)
            .where(TestRun.coursework_id == coursework.id)
            .where(TestRun.created_at >= cutoff)
        ).all()

        tested_repo_ids = {test_run.gitlab_repo_id for test_run in test_runs}
        total_runs = len(test_runs)
        succeeded_runs = sum(1 for test_run in test_runs if test_run.status == "succeeded")
        unstable_runs = sum(
            1 for test_run in test_runs if test_run.status in {"failed", "error"}
        )
        repo_count = len(unique_repos)

        active_repo_rate = (len(active_repo_ids) / repo_count * 100) if repo_count else 0
        tested_repo_rate = (len(tested_repo_ids) / repo_count * 100) if repo_count else 0
        pass_rate = (succeeded_runs / total_runs * 100) if total_runs else 0
        stability = (1 - unstable_runs / total_runs) * 100 if total_runs else 0

        return {
            "name": coursework.name,
            "commit_count": commit_count,
            "test_run_count": total_runs,
            "active_repo_rate": active_repo_rate,
            "tested_repo_rate": tested_repo_rate,
            "pass_rate": pass_rate,
            "stability": stability,
        }

    first_summary, second_summary = await asyncio.gather(
        summarize_coursework(coursework_by_id[coursework_a_id]),
        summarize_coursework(coursework_by_id[coursework_b_id]),
    )

    commit_volume_a, commit_volume_b = normalize_pair(
        first_summary["commit_count"],
        second_summary["commit_count"],
    )
    test_volume_a, test_volume_b = normalize_pair(
        first_summary["test_run_count"],
        second_summary["test_run_count"],
    )

    return CourseworkComparisonSummary(
        from_date=cutoff,
        series=[
            CourseworkComparisonSeries(
                key=first_summary["name"],
                data=[
                    CourseworkComparisonMetric(key="Commit Volume", data=commit_volume_a),
                    CourseworkComparisonMetric(key="Test Run Volume", data=test_volume_a),
                    CourseworkComparisonMetric(
                        key="Active Repos", data=first_summary["active_repo_rate"]
                    ),
                    CourseworkComparisonMetric(
                        key="Tested Repos", data=first_summary["tested_repo_rate"]
                    ),
                    CourseworkComparisonMetric(key="Pass Rate", data=first_summary["pass_rate"]),
                    CourseworkComparisonMetric(key="Stability", data=first_summary["stability"]),
                ],
            ),
            CourseworkComparisonSeries(
                key=second_summary["name"],
                data=[
                    CourseworkComparisonMetric(key="Commit Volume", data=commit_volume_b),
                    CourseworkComparisonMetric(key="Test Run Volume", data=test_volume_b),
                    CourseworkComparisonMetric(
                        key="Active Repos", data=second_summary["active_repo_rate"]
                    ),
                    CourseworkComparisonMetric(
                        key="Tested Repos", data=second_summary["tested_repo_rate"]
                    ),
                    CourseworkComparisonMetric(key="Pass Rate", data=second_summary["pass_rate"]),
                    CourseworkComparisonMetric(key="Stability", data=second_summary["stability"]),
                ],
            ),
        ],
    )
