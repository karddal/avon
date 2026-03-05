import argparse
import uuid
from pathlib import Path
from typing import Optional, Sequence
from datetime import date, datetime

from sqlalchemy import text
from datetime import datetime
from sqlmodel import Session, select

import os
from dotenv import load_dotenv
from app.models.programme import Programme
from app.models.unit import Unit
from app.models.coursework import Coursework
from app.models.unit_enrollment import UnitEnrollment
from app.models.notification import Notification

if os.getenv("ENV") == "dev":
    load_dotenv(".env.dev", override=False)
else:
    load_dotenv(".env", override=False)
    load_dotenv(".env.dev", override=False)

from app.db.session import engine

BASE_DIR = Path(__file__).resolve().parent.parent.parent
SQL_DIR = BASE_DIR / "sql"
DEFAULT_DROP_SQL = SQL_DIR / "drop.sql"
DEFAULT_SEED_SQL = SQL_DIR / "seed.sql"

def read_sql_file(path: Path) -> str:
    return path.read_text(encoding="utf-8")

def split_sql_statements(sql: str) -> list[str]:
    parts = [p.strip() for p in sql.split(";")]
    result = []
    for p in parts:
        if not p:
            continue
        if p.startswith("--"):
            continue
        result.append(p)
    return result

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

    stmts = split_sql_statements(sql)
    with engine.begin() as conn:
        for stmt in stmts:
            conn.execute(text(stmt))

GITLAB_ID_DEFAULT = "12345678"

def now_str() -> str:
    return datetime.now().replace(microsecond=0).isoformat(sep=" ")

def exec_stmt(session: Session, sql: str, params: dict | None = None):
    if params is None:
        params = {}
    return session.connection().execute(text(sql), params)

def fetch_one_str(session: Session, query: str, params: dict) -> Optional[str]:
    row = exec_stmt(session, query, params).first()
    if row is None:
        return None
    try:
        if hasattr(row, "_mapping") and "id" in row._mapping:
            v = row._mapping["id"]
            return None if v is None else str(v)
    except Exception:
        pass
    return None if row[0] is None else str(row[0])

def ensure_programme(session: Session, name: str, start_date: str, end_date: str) -> uuid.UUID:
    existing = session.exec(select(Programme).where(Programme.name == name)).first()
    if existing:
        return existing.id

    p = Programme(
        name=name,
        start_date=date.fromisoformat(start_date),
        end_date=date.fromisoformat(end_date),
        gitlab_id=GITLAB_ID_DEFAULT,
    )
    session.add(p)
    session.commit()
    session.refresh(p)
    return p.id

def ensure_unit(session: Session, programme_id: uuid.UUID, name: str, description: str, colour: str, unit_code: str) -> uuid.UUID:
    existing = session.exec(
        select(Unit).where(Unit.programme_id == programme_id, Unit.unit_code == unit_code)
    ).first()
    if existing:
        return existing.id

    u = Unit(
        name=name,
        description=description,
        unit_code=unit_code,
        colour=colour,
        programme_id=programme_id,
        gitlab_id=GITLAB_ID_DEFAULT,
        creation_date=datetime.now(),
    )
    session.add(u)
    session.commit()
    session.refresh(u)
    return u.id


def ensure_unit_enrollment(session: Session, unit_id: str, user_id: str, enrol_type: str) -> None:
    existing = session.exec(
        select(UnitEnrollment).where(
            UnitEnrollment.unit_id == unit_id,
            UnitEnrollment.user_id == user_id,
            UnitEnrollment.type == enrol_type,
        )
    ).first()
    if existing:
        return

    e = UnitEnrollment(unit_id=unit_id, user_id=user_id, type=enrol_type)
    session.add(e)
    session.commit()

def ensure_coursework(session: Session, unit_id: str, name: str, description: str, colour: str, due_date: str) -> uuid.UUID:
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

    c = Coursework(
        name=name,
        description=description,
        unit_id=unit_id,
        due_date=due,
        creation_date=datetime.now(),
        colour=colour,
        gitlab_id=GITLAB_ID_DEFAULT,
        template_id=None,
    )
    session.add(c)
    session.commit()
    session.refresh(c)
    return c.id

def seed_api() -> None:
    with Session(engine) as session:
        students = exec_stmt(session, 'SELECT id FROM "user" WHERE role = \'user\'').fetchall()
        lecturers = exec_stmt(session, 'SELECT id FROM "user" WHERE role = \'lecturer\'').fetchall()
        student_ids = [str(r[0]) for r in students]
        lecturer_ids = [str(r[0]) for r in lecturers]

        programmes_to_create = [
            ("Year 1 Computer Science 2025-2026", "2025-09-10", "2026-05-30"),
            ("Year 2 Computer Science 2025-2026", "2025-09-10", "2026-05-30"),
            ("Year 1 Computer Science 2024-2025", "2024-09-10", "2025-05-30"),
            ("Year 2 Computer Science 2024-2025", "2024-09-10", "2025-05-30"),
        ]

        for name, start_date, end_date in programmes_to_create:
            ensure_programme(session, name, start_date, end_date)

        def get_prog_id(name: str) -> str:
            p = session.exec(select(Programme).where(Programme.name == name)).first()
            if not p:
                raise RuntimeError(f"Programme not found: {name}")
            return p.id

        id_y1_2526 = get_prog_id("Year 1 Computer Science 2025-2026")
        id_y2_2526 = get_prog_id("Year 2 Computer Science 2025-2026")
        id_y1_2425 = get_prog_id("Year 1 Computer Science 2024-2025")

        def create_unit_with_students_and_lecturers(prog_id: str, unit: dict) -> str:
            unit_id = ensure_unit(
                session,
                programme_id=prog_id,
                name=unit["name"],
                description=unit["description"],
                colour=unit["colour"],
                unit_code=unit["unit_code"],
            )
            for sid in student_ids:
                ensure_unit_enrollment(session, unit_id, sid, "student")
            for lid in lecturer_ids:
                ensure_unit_enrollment(session, unit_id, lid, "lecturer")
            return unit_id

        _ = create_unit_with_students_and_lecturers(
            id_y1_2425,
            {
                "name": "Mathematics for Computer Science A",
                "description": "I love maths A",
                "colour": "abcdef",
                "unit_code": "COMS10014",
            },
        )

        unit_arch24 = create_unit_with_students_and_lecturers(
            id_y1_2425,
            {
                "name": "Computer Architecture",
                "description": "Encrypt coursework very hard",
                "colour": "343434",
                "unit_code": "COMS10015",
            },
        )

        unit_impfunc24 = create_unit_with_students_and_lecturers(
            id_y1_2425,
            {
                "name": "Imperative and Functional Programming",
                "description": "malloc() and memory leaks",
                "colour": "565656",
                "unit_code": "COMS10016",
            },
        )

        _ = create_unit_with_students_and_lecturers(
            id_y1_2526,
            {
                "name": "Mathematics for Computer Science A",
                "description": "I love maths A, now in 2025!!",
                "colour": "abcdef",
                "unit_code": "COMS10014",
            },
        )

        unit_arch25 = create_unit_with_students_and_lecturers(
            id_y1_2526,
            {
                "name": "Computer Architecture",
                "description": "Encrypt coursework very hard",
                "colour": "343434",
                "unit_code": "COMS10015",
            },
        )

        unit_impfunc25 = create_unit_with_students_and_lecturers(
            id_y1_2526,
            {
                "name": "Imperative and Functional Programming",
                "description": "malloc() and memory leaks",
                "colour": "565656",
                "unit_code": "COMS10016",
            },
        )

        unit_se25 = create_unit_with_students_and_lecturers(
            id_y2_2526,
            {
                "name": "Software Engineering Project",
                "description": "Agile agile agile",
                "colour": "112233",
                "unit_code": "COMS20006",
            },
        )

        _ = create_unit_with_students_and_lecturers(
            id_y2_2526,
            {
                "name": "Programming Languages and Computation",
                "description": "Very hard unit",
                "colour": "454545",
                "unit_code": "COMS20007",
            },
        )

        _ = create_unit_with_students_and_lecturers(
            id_y2_2526,
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
        units = session.exec(select(Unit)).all()
        bad = sum(1 for u in units if u.programme is None)
        print("Units with programme relationship None:", bad)

def cmd_seed(args: argparse.Namespace) -> None:
    exec_sql_file(Path(args.drop_sql).resolve())

    exec_sql_file(Path(args.seed_sql).resolve())

    seed_api()
    print("Seed successful")

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="python -m app.manage")
    sub = p.add_subparsers(dest="command", required=True)

    ps = sub.add_parser("seed")
    ps.add_argument("--drop-sql", default=str(DEFAULT_DROP_SQL))
    ps.add_argument("--seed-sql", default=str(DEFAULT_SEED_SQL))
    ps.set_defaults(func=cmd_seed)

    return p

def main(argv: Optional[Sequence[str]] = None) -> None:
    args = build_parser().parse_args(argv)
    args.func(args)

if __name__ == "__main__":
    main()