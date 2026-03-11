import threading
import uuid
from datetime import date, datetime
from pathlib import Path

from sqlalchemy import Column, MetaData, String, Table, select as sa_select, text
from sqlmodel import Session, select

from app.models.notification import Notification
from app.db.session import engine
from app.models.coursework import Coursework
from app.models.programme import Programme
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment

BASE_DIR = Path(__file__).resolve().parent.parent.parent
SQL_DIR = BASE_DIR / "sql"
DEFAULT_DROP_SQL = SQL_DIR / "drop.sql"
DEFAULT_SEED_SQL = SQL_DIR / "seed.sql"

GITLAB_ID_DEFAULT = "12345678"
RESET_LOCK = threading.Lock()

_auth_metadata = MetaData()
_user_table = Table(
    "user",
    _auth_metadata,
    Column("id", String),
    Column("role", String),
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


def _fetch_user_ids_by_role(session: Session, role: str) -> list[str]:
    statement = sa_select(_user_table.c.id).where(_user_table.c.role == role)
    return [str(row[0]) for row in session.exec(statement).all()]


def ensure_programme(
    session: Session,
    *,
    name: str,
    start_date: str,
    end_date: str,
) -> uuid.UUID:
    existing = session.exec(select(Programme).where(Programme.name == name)).first()
    if existing:
        return existing.id

    programme = Programme(
        name=name,
        start_date=date.fromisoformat(start_date),
        end_date=date.fromisoformat(end_date),
        gitlab_id=GITLAB_ID_DEFAULT,
    )
    session.add(programme)
    session.flush()
    return programme.id


def ensure_unit(
    session: Session,
    *,
    programme_id: uuid.UUID,
    name: str,
    description: str,
    colour: str,
    unit_code: str,
) -> uuid.UUID:
    existing = session.exec(
        select(Unit).where(Unit.programme_id == programme_id, Unit.unit_code == unit_code)
    ).first()
    if existing:
        return existing.id

    unit = Unit(
        name=name,
        description=description,
        unit_code=unit_code,
        colour=colour,
        programme_id=programme_id,
        gitlab_id=GITLAB_ID_DEFAULT,
        creation_date=datetime.now(),
    )
    session.add(unit)
    session.flush()
    return unit.id


def ensure_unit_enrollment(
    session: Session,
    *,
    unit_id: uuid.UUID,
    user_id: str,
    enrolment_type: str,
) -> None:
    existing = session.exec(
        select(UnitEnrollment).where(
            UnitEnrollment.unit_id == unit_id,
            UnitEnrollment.user_id == user_id,
        )
    ).first()
    if existing:
        if existing.type != enrolment_type:
            existing.type = enrolment_type
            session.add(existing)
        return

    enrollment = UnitEnrollment(unit_id=unit_id, user_id=user_id, type=enrolment_type)
    session.add(enrollment)
    session.flush()


def ensure_coursework(
    session: Session,
    *,
    unit_id: uuid.UUID,
    name: str,
    description: str,
    colour: str,
    due_date: str,
) -> uuid.UUID:
    due = datetime.strptime(due_date, "%Y-%m-%d %H:%M:%S")

    existing = session.exec(
        select(Coursework).where(
            Coursework.unit_id == unit_id,
            Coursework.name == name,
            Coursework.due_date == due,
        )
    ).first()
    if existing:
        return existing.id

    coursework = Coursework(
        name=name,
        description=description,
        unit_id=unit_id,
        due_date=due,
        creation_date=datetime.now(),
        colour=colour,
        gitlab_id=GITLAB_ID_DEFAULT,
        template_id=None,
    )
    session.add(coursework)
    session.flush()
    return coursework.id


def seed_database_data(session: Session) -> None:
    student_ids = _fetch_user_ids_by_role(session, "user")
    lecturer_ids = _fetch_user_ids_by_role(session, "lecturer")

    programmes = {
        "Year 1 Computer Science 2025-2026": ensure_programme(
            session,
            name="Year 1 Computer Science 2025-2026",
            start_date="2025-09-10",
            end_date="2026-05-30",
        ),
        "Year 2 Computer Science 2025-2026": ensure_programme(
            session,
            name="Year 2 Computer Science 2025-2026",
            start_date="2025-09-10",
            end_date="2026-05-30",
        ),
        "Year 1 Computer Science 2024-2025": ensure_programme(
            session,
            name="Year 1 Computer Science 2024-2025",
            start_date="2024-09-10",
            end_date="2025-05-30",
        ),
        "Year 2 Computer Science 2024-2025": ensure_programme(
            session,
            name="Year 2 Computer Science 2024-2025",
            start_date="2024-09-10",
            end_date="2025-05-30",
        ),
    }

    def create_unit_with_members(programme_name: str, unit_data: dict[str, str]) -> uuid.UUID:
        unit_id = ensure_unit(
            session,
            programme_id=programmes[programme_name],
            name=unit_data["name"],
            description=unit_data["description"],
            colour=unit_data["colour"],
            unit_code=unit_data["unit_code"],
        )

        for student_id in student_ids:
            ensure_unit_enrollment(
                session,
                unit_id=unit_id,
                user_id=student_id,
                enrolment_type="student",
            )

        for lecturer_id in lecturer_ids:
            ensure_unit_enrollment(
                session,
                unit_id=unit_id,
                user_id=lecturer_id,
                enrolment_type="lecturer",
            )

        return unit_id

    create_unit_with_members(
        "Year 1 Computer Science 2024-2025",
        {
            "name": "Mathematics for Computer Science A",
            "description": "I love maths A",
            "colour": "abcdef",
            "unit_code": "COMS10014",
        },
    )

    unit_arch24 = create_unit_with_members(
        "Year 1 Computer Science 2024-2025",
        {
            "name": "Computer Architecture",
            "description": "Encrypt coursework very hard",
            "colour": "343434",
            "unit_code": "COMS10015",
        },
    )

    unit_impfunc24 = create_unit_with_members(
        "Year 1 Computer Science 2024-2025",
        {
            "name": "Imperative and Functional Programming",
            "description": "malloc() and memory leaks",
            "colour": "565656",
            "unit_code": "COMS10016",
        },
    )

    create_unit_with_members(
        "Year 1 Computer Science 2025-2026",
        {
            "name": "Mathematics for Computer Science A",
            "description": "I love maths A, now in 2025!!",
            "colour": "abcdef",
            "unit_code": "COMS10014",
        },
    )

    unit_arch25 = create_unit_with_members(
        "Year 1 Computer Science 2025-2026",
        {
            "name": "Computer Architecture",
            "description": "Encrypt coursework very hard",
            "colour": "343434",
            "unit_code": "COMS10015",
        },
    )

    unit_impfunc25 = create_unit_with_members(
        "Year 1 Computer Science 2025-2026",
        {
            "name": "Imperative and Functional Programming",
            "description": "malloc() and memory leaks",
            "colour": "565656",
            "unit_code": "COMS10016",
        },
    )

    unit_se25 = create_unit_with_members(
        "Year 2 Computer Science 2025-2026",
        {
            "name": "Software Engineering Project",
            "description": "Agile agile agile",
            "colour": "112233",
            "unit_code": "COMS20006",
        },
    )

    create_unit_with_members(
        "Year 2 Computer Science 2025-2026",
        {
            "name": "Programming Languages and Computation",
            "description": "Very hard unit",
            "colour": "454545",
            "unit_code": "COMS20007",
        },
    )

    create_unit_with_members(
        "Year 2 Computer Science 2025-2026",
        {
            "name": "Computer Systems A",
            "description": "Go go go go go & Game of Life",
            "colour": "676767",
            "unit_code": "COMS20017",
        },
    )

    ensure_coursework(
        session,
        unit_id=unit_impfunc24,
        name="Power to the People in 2024",
        description="Easy Haskell 1",
        colour="676767",
        due_date="2024-12-15 23:59:00",
    )
    ensure_coursework(
        session,
        unit_id=unit_impfunc24,
        name="Double Linked List 2024",
        description="literally the title",
        colour="b01c2e",
        due_date="2024-10-30 23:59:00",
    )
    ensure_coursework(
        session,
        unit_id=unit_arch24,
        name="Encrypt",
        description="Did you know you can encrypt with binary? Includes v1 v2 v3",
        colour="1a2b3c",
        due_date="2024-11-10 14:00:00",
    )
    ensure_coursework(
        session,
        unit_id=unit_impfunc25,
        name="Power to the People in 2025",
        description="Easy Haskell 1",
        colour="abcdef",
        due_date="2025-12-15 23:59:00",
    )
    ensure_coursework(
        session,
        unit_id=unit_se25,
        name="AI Bill Splitter",
        description="Splitvise but with Vibes, should have been called splitvibes",
        colour="f1d2c3",
        due_date="2026-04-20 17:00:00",
    )
    ensure_coursework(
        session,
        unit_id=unit_arch25,
        name="Encrypt",
        description="Did you know you can encrypt with binary?",
        colour="1a2b3c",
        due_date="2026-05-10 14:00:00",
    )


def reset_database(
    drop_sql_path: Path = DEFAULT_DROP_SQL,
    seed_sql_path: Path = DEFAULT_SEED_SQL,
) -> dict[str, str]:
    with RESET_LOCK:
        engine.dispose()
        exec_sql_file(drop_sql_path)
        exec_sql_file(seed_sql_path)

        with Session(engine) as session:
            try:
                seed_database_data(session)
                session.commit()
            except Exception:
                session.rollback()
                raise

        engine.dispose()

    return {"status": "ok", "message": "Database reset and seeded"}

