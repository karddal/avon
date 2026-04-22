import threading
from datetime import date, datetime, time, timedelta
from pathlib import Path
from typing import Sequence

from sqlalchemy import Column, MetaData, String, Table, select as sa_select, text
from sqlmodel import Session, SQLModel

from app.models.base_image import BaseImage
from app.db.session import engine
from app.models.coursework import Coursework
from app.models.notification import Notification  # Registers Unit.notifications.
from app.models.programme import Programme
from app.models.student_repo import StudentRepo
from app.models.test_run import TestRun, TestRunResult
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment

BASE_DIR = Path(__file__).resolve().parent.parent.parent
SQL_DIR = BASE_DIR / "sql"
DEFAULT_SEED_SQL = SQL_DIR / "seed.sql"

GITLAB_ID_DEFAULT = "12345678"
RESET_LOCK = threading.Lock()

PROGRAMME_SEEDS = (
    {
        "key": "y1_current",
        "study_year": 1,
        "academic_year_offset": 0,# for example if today is before september 10th, so this year and last year "2025-2026"
    },
    {
        "key": "y2_current",
        "study_year": 2,
        "academic_year_offset": 0,
    },
    {
        "key": "y1_previous",
        "study_year": 1,
        "academic_year_offset": -1,# this as the last example data will be "2024-2025"
    },
    {
        "key": "y2_previous",
        "study_year": 2,
        "academic_year_offset": -1,
    },
)

UNIT_SEEDS = (
    {
        "key": "maths24",
        "programme_key": "y1_previous",
        "name": "Mathematics for Computer Science A",
        "description": "I love maths A",
        "colour": "abcdef",
        "unit_code": "COMS10014",
    },
    {
        "key": "arch24",
        "programme_key": "y1_previous",
        "name": "Computer Architecture",
        "description": "Encrypt coursework very hard",
        "colour": "343434",
        "unit_code": "COMS10015",
    },
    {
        "key": "impfunc24",
        "programme_key": "y1_previous",
        "name": "Imperative and Functional Programming",
        "description": "malloc() and memory leaks",
        "colour": "565656",
        "unit_code": "COMS10016",
    },
    {
        "key": "maths25",
        "programme_key": "y1_current",
        "name": "Mathematics for Computer Science A",
        "description": "I love maths A, now in 2025!!",
        "colour": "abcdef",
        "unit_code": "COMS10014",
    },
    {
        "key": "arch25",
        "programme_key": "y1_current",
        "name": "Computer Architecture",
        "description": "Encrypt coursework very hard",
        "colour": "343434",
        "unit_code": "COMS10015",
    },
    {
        "key": "impfunc25",
        "programme_key": "y1_current",
        "name": "Imperative and Functional Programming",
        "description": "malloc() and memory leaks",
        "colour": "565656",
        "unit_code": "COMS10016",
    },
    {
        "key": "se25",
        "programme_key": "y2_current",
        "name": "Software Engineering Project",
        "description": "Agile agile agile",
        "colour": "112233",
        "unit_code": "COMS20006",
    },
    {
        "key": "plc25",
        "programme_key": "y2_current",
        "name": "Programming Languages and Computation",
        "description": "Very hard unit",
        "colour": "454545",
        "unit_code": "COMS20007",
    },
    {
        "key": "systems25",
        "programme_key": "y2_current",
        "name": "Computer Systems A",
        "description": "Go go go go go & Game of Life",
        "colour": "676767",
        "unit_code": "COMS20017",
    },
)

COURSEWORK_SEEDS = (
    {
        "unit_key": "impfunc24",
        "name": "Power to the People in 2024",
        "description": "Easy Haskell 1",
        "colour": "676767",
        "due_in_days": -100,
    },
    {
        "unit_key": "impfunc24",
        "name": "Double Linked List 2024",
        "description": "literally the title",
        "colour": "b01c2e",
        "due_in_days": -200,
    },
    {
        "unit_key": "arch24",
        "name": "Encrypt",
        "description": "Did you know you can encrypt with binary? Includes v1 v2 v3",
        "colour": "1a2b3c",
        "due_in_days": -150,
    },
    {
        "unit_key": "impfunc25",
        "name": "Power to the People in 2025",
        "description": "Easy Haskell 1",
        "colour": "abcdef",
        "due_in_days": 50,
    },
    {
        "unit_key": "se25",
        "name": "AI Bill Splitter",
        "description": "Splitvise but with Vibes, should have been called splitvibes",
        "colour": "f1d2c3",
        "due_in_days": 20,
    },
    {
        "unit_key": "arch25",
        "name": "Encrypt",
        "description": "Did you know you can encrypt with binary?",
        "colour": "1a2b3c",
        "due_in_days": 30,
    },
)

_auth_metadata = MetaData()
_user_table = Table(
    "user",
    _auth_metadata,
    Column("id", String),
    Column("role", String),
)
_account_table = Table("account", _auth_metadata)
_jwks_table = Table("jwks", _auth_metadata)
_session_table = Table("session", _auth_metadata)
_verification_table = Table("verification", _auth_metadata)

FULL_RESET_TABLES = (
    _account_table,
    _session_table,
    TestRunResult.__table__,
    TestRun.__table__,
    StudentRepo.__table__,
    BaseImage.__table__,
    Coursework.__table__,
    Notification.__table__,
    UnitEnrollment.__table__,
    Unit.__table__,
    Programme.__table__,
    _verification_table,
    _jwks_table,
    _user_table,
)
APP_RESET_TABLES = (
    TestRunResult.__table__,
    TestRun.__table__,
    StudentRepo.__table__,
    BaseImage.__table__,
    Notification.__table__,
    Coursework.__table__,
    UnitEnrollment.__table__,
    Unit.__table__,
    Programme.__table__,
)


def read_sql_file(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def split_sql_statements(sql: str) -> list[str]:
    lines = []
    for line in sql.splitlines():
        if line.strip().startswith("--"):
            continue
        lines.append(line)

    cleaned_sql = "\n".join(lines)
    return [statement.strip() for statement in cleaned_sql.split(";") if statement.strip()]


def exec_sql_file(path: Path) -> None:
    sql = read_sql_file(path)

    if str(engine.url).startswith("sqlite"):
        raw = engine.raw_connection()
        try:
            raw.executescript(sql)
            raw.commit()
        finally:
            raw.close()
        return

    statements = split_sql_statements(sql)
    with engine.begin() as conn:
        for statement in statements:
            conn.execute(text(statement))


def drop_tables(tables: Sequence[Table] = FULL_RESET_TABLES) -> None:
    with engine.begin() as conn:
        for table in tables:
            table.drop(bind=conn, checkfirst=True)


def clear_tables(tables: Sequence[Table] = APP_RESET_TABLES) -> None:
    with engine.begin() as conn:
        for table in tables:
            conn.execute(table.delete())


def _fetch_user_ids_by_role(session: Session, role: str) -> list[str]:
    statement = sa_select(_user_table.c.id).where(_user_table.c.role == role)
    return [str(row[0]) for row in session.exec(statement).all()]


def _current_academic_year_start(today: date | None = None) -> int:
    today = today or date.today()

    # academic year start day (today is before this will be "previs year-this year" i.e. "2025-2026")
    if (today.month, today.day) >= (9, 10):
        return today.year

    return today.year - 1


def _programme_seed_years(
    seed: dict[str, str | int],
    today: date | None = None,
) -> tuple[int, int]:
    start_year = _current_academic_year_start(today) + int(seed["academic_year_offset"])
    return start_year, start_year + 1


def _programme_seed_name(seed: dict[str, str | int], today: date | None = None) -> str:
    start_year, end_year = _programme_seed_years(seed, today)
    return f"Year {seed['study_year']} Computer Science {start_year}-{end_year}"


def _programme_seed_start_date(
    seed: dict[str, str | int],
    today: date | None = None,
) -> date:
    start_year, _end_year = _programme_seed_years(seed, today)
    return date(start_year, 9, 10)


def _programme_seed_end_date(
    seed: dict[str, str | int],
    today: date | None = None,
) -> date:
    _start_year, end_year = _programme_seed_years(seed, today)
    return date(end_year, 5, 30)


def _build_programmes(today: date | None = None) -> dict[str, Programme]:
    return {
        str(seed["key"]): Programme(
            name=_programme_seed_name(seed, today),
            start_date=_programme_seed_start_date(seed, today),
            end_date=_programme_seed_end_date(seed, today),
            gitlab_id=GITLAB_ID_DEFAULT,
        )
        for seed in PROGRAMME_SEEDS
    }


def _build_units(programmes: dict[str, Programme]) -> dict[str, Unit]:
    units: dict[str, Unit] = {}

    for seed in UNIT_SEEDS:
        units[seed["key"]] = Unit(
            name=seed["name"],
            description=seed["description"],
            unit_code=seed["unit_code"],
            colour=seed["colour"],
            programme_id=programmes[str(seed["programme_key"])].id,
            gitlab_id=GITLAB_ID_DEFAULT,
            creation_date=datetime.now(),
        )

    return units


def _build_unit_enrollments(
    units: dict[str, Unit],
    student_ids: list[str],
    lecturer_ids: list[str],
) -> list[UnitEnrollment]:
    enrollments: list[UnitEnrollment] = []

    for unit in units.values():
        enrollments.extend(
            UnitEnrollment(unit_id=unit.id, user_id=user_id, type="student")
            for user_id in student_ids
        )
        enrollments.extend(
            UnitEnrollment(unit_id=unit.id, user_id=user_id, type="lecturer")
            for user_id in lecturer_ids
        )

    return enrollments


def _coursework_due_date(seed: dict[str, str | int]) -> datetime:
    due_date = date.today() + timedelta(days=int(seed["due_in_days"]))
    return datetime.combine(due_date, time(hour=17, minute=0, second=0))


def _build_courseworks(units: dict[str, Unit]) -> list[Coursework]:
    return [
        Coursework(
            name=seed["name"],
            description=seed["description"],
            unit_id=units[seed["unit_key"]].id,
            due_date=_coursework_due_date(seed),
            creation_date=datetime.now(),
            colour=seed["colour"],
            gitlab_id=GITLAB_ID_DEFAULT,
            template_id=None,
        )
        for seed in COURSEWORK_SEEDS
    ]


def seed_database_data(session: Session) -> None:
    student_ids = _fetch_user_ids_by_role(session, "user")
    lecturer_ids = _fetch_user_ids_by_role(session, "lecturer")

    programmes = _build_programmes()
    units = _build_units(programmes)

    session.add_all(list(programmes.values()))
    session.add_all(list(units.values()))
    session.add_all(_build_unit_enrollments(units, student_ids, lecturer_ids))
    session.add_all(_build_courseworks(units))


def reset_database(
    seed_sql_path: Path = DEFAULT_SEED_SQL,
) -> dict[str, str]:
    with RESET_LOCK:
        engine.dispose()
        drop_tables()
        exec_sql_file(seed_sql_path)
        SQLModel.metadata.create_all(engine)

        with Session(engine) as session:
            try:
                seed_database_data(session)
                session.commit()
            except Exception:
                session.rollback()
                raise

        engine.dispose()

    return {"status": "ok", "message": "Database reset and seeded"}


def reset_app_data() -> dict[str, str]:
    with RESET_LOCK:
        clear_tables()

        with Session(engine) as session:
            try:
                seed_database_data(session)
                session.commit()
            except Exception:
                session.rollback()
                raise

    return {"status": "ok", "message": "Application data reset and seeded"}
