import datetime
import os
from contextlib import asynccontextmanager
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from sqlmodel import Session, SQLModel, create_engine, select

from app.models.coursework import Coursework
from app.models.programme import Programme
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment

if os.getenv("ENV") == "dev":
    env_file = ".env.dev"
    load_dotenv(dotenv_path=env_file)

db_url = os.getenv("DATABASE_URL")
if not db_url:
    raise RuntimeError("No database url found")
connect_args = {"check_same_thread": False}
engine = create_engine(db_url, connect_args=connect_args)


# Create session dependency so that you use only one session per request
def get_session():
    with Session(engine) as session:
        yield session


# Create the tables
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    print("Database created")


def seed_data():
    academic_year_202526_start = datetime.date(year=2025, month=9, day=10)
    academic_year_202526_end = datetime.date(year=2026, month=5, day=30)
    print("hello")
    with Session(engine) as session:
        statement = select(Programme)
        unit_group_data = session.exec(statement).first()
        if not unit_group_data:
            p1 = Programme(
                name="Year 1 Computer Science 2025/2026",
                start_date=academic_year_202526_start,
                end_date=academic_year_202526_end,
            )
            p2 = Programme(
                name="Year 2 Computer Science 2025/2026",
                start_date=academic_year_202526_start,
                end_date=academic_year_202526_end,
            )
            p3 = Programme(
                name="Year 3 Computer Science 2025/2026",
                start_date=academic_year_202526_start,
                end_date=academic_year_202526_end,
            )
            session.add_all([p1, p2, p3])  # Added this line
            session.commit()  # Added this line
            session.refresh(p1)  # Added this line
            session.refresh(p2)  # Added this line
            session.refresh(p3)  # Added this line
        else:
            # If groups already exist, fetch them
            groups = session.exec(select(Programme)).all()
            p1, p2, p3 = groups[0], groups[1], groups[2]

        # Get Units
        statement = select(Unit)
        unit_result = session.exec(statement).first()
        # Populate the Units Page if empty
        if not unit_result:
            unit1 = Unit(
                name="Algorithms and Data",
                description="hard unit",
                unit_code="COMS20017",
                colour="abcdef",
                programme_id=p2.id,
                start_date=None,
                end_date=None,
            )
            unit2 = Unit(
                name="Software Engineering Project",
                description="lots of work",
                unit_code="COMS20006",
                colour="b01c2e",
                programme_id=p2.id,
                start_date=None,
                end_date=None,
            )
            unit3 = Unit(
                name="Imperative and Functional Programming",
                description="haskell was enlightening",
                unit_code="COMS10016",
                colour="f1d2c3",
                programme_id=p1.id,
                start_date=None,
                end_date=None,
            )
            unit4 = Unit(
                name="Computer Architecture",
                description="second part was very fun",
                unit_code="COMS10015",
                colour="1a2b3c",
                programme_id=p1.id,
                start_date=None,
                end_date=None,
            )
            # create standalone unit too
            unit5 = Unit(
                name="Remedial Maths",
                description="Maths is very hard...",
                unit_code="COMSREMEDIALMATHS",
                colour="333333",
                programme_id=None,
                start_date=datetime.date(year=2025, month=12, day=1),
                end_date=datetime.date(year=2026, month=3, day=1),
            )
            session.add_all([unit1, unit2, unit3, unit4, unit5])
            session.commit()
            session.refresh(unit1)
            session.refresh(unit2)
            session.refresh(unit3)
            session.refresh(unit4)
            session.refresh(unit5)
        else:
            # If units already exist, fetch them so we can use them later
            units = session.exec(select(Unit)).all()
            unit1, unit2, unit3, unit4, unit5 = (
                units[0],
                units[1],
                units[2],
                units[3],
                units[4],
            )

        # Get Coursework
        statement = select(Coursework)
        coursework_result = session.exec(statement).first()  # Changed from Session.exec
        if not coursework_result:
            coursework1 = Coursework(
                name="Power to the People",
                description="Easy Haskell 1",
                unit_id=unit3.id,
                due_date=datetime.datetime(2025, 12, 15, 23, 59),
                colour="abcdef",
            )
            coursework2 = Coursework(
                name="Double Linked List",
                description="literally the title",
                unit_id=unit3.id,
                due_date=datetime.datetime(2025, 11, 30, 23, 59),
                colour="b01c2e",
            )
            coursework3 = Coursework(
                name="AI Bill Splitter",
                description="Splitvise but with Vibes, should have been called splitvibes",
                unit_id=unit2.id,
                due_date=datetime.datetime(2025, 11, 20, 17, 00),
                colour="f1d2c3",
            )
            coursework4 = Coursework(
                name="Encrypt",
                description="Did you know you can encrypt with binary?",
                unit_id=unit4.id,
                due_date=datetime.datetime(2025, 12, 10, 14, 00),
                colour="1a2b3c",
            )
            session.add_all([coursework1, coursework2, coursework3, coursework4])
            session.commit()

        # Get user
        statement = select(UnitEnrollment)
        unit_enrollment_data = session.exec(statement).first()
        if not unit_enrollment_data:
            enrollment1 = UnitEnrollment(
                unit_id=unit1.id, user_id="Iu8NEUz0Q5DyhpeNAACCv397QYXEcxqd"
            )
            enrollment2 = UnitEnrollment(
                unit_id=unit2.id, user_id="Iu8NEUz0Q5DyhpeNAACCv397QYXEcxqd"
            )
            enrollment3 = UnitEnrollment(
                unit_id=unit3.id, user_id="Iu8NEUz0Q5DyhpeNAACCv397QYXEcxqd"
            )
            enrollment4 = UnitEnrollment(
                unit_id=unit4.id, user_id="Iu8NEUz0Q5DyhpeNAACCv397QYXEcxqd"
            )

            enrollment5 = UnitEnrollment(
                unit_id=unit1.id, user_id="P4uY6u3aG68to2ePrOcC48XuwCs3vOHO"
            )
            enrollment6 = UnitEnrollment(
                unit_id=unit2.id, user_id="P4uY6u3aG68to2ePrOcC48XuwCs3vOHO"
            )
            enrollment7 = UnitEnrollment(
                unit_id=unit3.id, user_id="P4uY6u3aG68to2ePrOcC48XuwCs3vOHO"
            )

            enrollment8 = UnitEnrollment(
                unit_id=unit1.id, user_id="fRMZiXJl6xiEWz1PzJwUYHiSGG5dJlAW"
            )
            enrollment9 = UnitEnrollment(
                unit_id=unit4.id, user_id="fRMZiXJl6xiEWz1PzJwUYHiSGG5dJlAW"
            )

            enrollment10 = UnitEnrollment(
                unit_id=unit1.id, user_id="yH57Fn6QVfByFaEmBC15ydxpNBYz17D4"
            )
            enrollment11 = UnitEnrollment(
                unit_id=unit2.id, user_id="yH57Fn6QVfByFaEmBC15ydxpNBYz17D4"
            )
            enrollment12 = UnitEnrollment(
                unit_id=unit3.id, user_id="yH57Fn6QVfByFaEmBC15ydxpNBYz17D4"
            )
            enrollment13 = UnitEnrollment(
                unit_id=unit4.id, user_id="yH57Fn6QVfByFaEmBC15ydxpNBYz17D4"
            )

            lectEnroll1 = UnitEnrollment(
                unit_id=unit3.id, user_id="Tj0PhP5UnIQsIEHhyfFIeUUtf3Tk3a7y"
            )

            session.add_all(
                [
                    enrollment1,
                    enrollment2,
                    enrollment3,
                    enrollment4,
                    enrollment5,
                    enrollment6,
                    enrollment7,
                    enrollment8,
                    enrollment9,
                    enrollment10,
                    enrollment11,
                    enrollment12,
                    enrollment13,
                    lectEnroll1,
                ]
            )
            session.commit()

        # statement = select(UnitGroupMember)
        # data = session.exec(statement).first()  # Changed from Session.exec
        # if not data:
        #     ugm1 = UnitGroupMember(group_id=group1.id, unit_id=unit3.id)
        #     ugm2 = UnitGroupMember(group_id=group1.id, unit_id=unit4.id)

        #     ugm3 = UnitGroupMember(group_id=group2.id, unit_id=unit1.id)
        #     ugm4 = UnitGroupMember(group_id=group2.id, unit_id=unit2.id)

        #     ugm5 = UnitGroupMember(group_id=group3.id, unit_id=unit1.id)
        #     ugm6 = UnitGroupMember(group_id=group3.id, unit_id=unit2.id)
        #     ugm7 = UnitGroupMember(group_id=group3.id, unit_id=unit3.id)
        #     ugm8 = UnitGroupMember(group_id=group3.id, unit_id=unit4.id)

        #     session.add_all([ugm1, ugm2, ugm3, ugm4, ugm5, ugm6, ugm7, ugm8])
        #     session.commit()
        print("Database seeded successfully")


SessionDep = Annotated[Session, Depends(get_session)]


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    print("yo yo")
    seed_data()
    print("beep beep")
    yield
