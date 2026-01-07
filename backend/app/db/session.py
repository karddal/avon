import datetime
import os
from contextlib import asynccontextmanager
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from sqlmodel import Session, SQLModel, create_engine

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
    academic_year_202425_start = datetime.date(year=2024, month=9, day=10)
    academic_year_202425_end = datetime.date(year=2025, month=5, day=30)
    print("hello, dropping all tables, enter to continue")
    input()
    with Session(engine) as session:
        Unit.__table__.drop(engine)
        UnitEnrollment.__table__.drop(engine)
        Programme.__table__.drop(engine)
        Coursework.__table__.drop(engine)
        create_db_and_tables()
        y1_25_26 = Programme(
            name="Year 1 Computer Science 2025/2026",
            start_date=academic_year_202526_start,
            end_date=academic_year_202526_end,
        )
        y2_25_26 = Programme(
            name="Year 2 Computer Science 2025/2026",
            start_date=academic_year_202526_start,
            end_date=academic_year_202526_end,
        )
        y1_24_25 = Programme(
            name="Year 1 Computer Science 2024/2025",
            start_date=academic_year_202425_start,
            end_date=academic_year_202425_end,
        )
        y2_24_25 = Programme(
            name="Year 2 Computer Science 2024/2025",
            start_date=academic_year_202425_start,
            end_date=academic_year_202425_end,
        )
        session.add_all([y1_25_26, y2_25_26, y1_24_25, y2_24_25])  # Added this line
        session.commit()  # Added this line
        session.refresh(y1_25_26)  # Added this line
        session.refresh(y2_25_26)  # Added this line
        session.refresh(y1_24_25)  # Added this line
        session.refresh(y2_24_25)  # Added this line

        # Populate the Units Page
        # YEAR 1 UNITS

        maths_for_cs_a_2024_2025 = Unit(
            name="Mathematics for Computer Science A",
            description="I love maths A",
            unit_code="COMS10014",
            colour="abcdef",
            programme_id=y1_24_25.id,
        )
        maths_for_cs_a_2025_2026 = Unit(
            name="Mathematics for Computer Science A",
            description="I love maths A, now in 2025!!",
            unit_code="COMS10014",
            colour="abcdef",
            programme_id=y1_25_26.id,
        )
        comp_arch_2024_2025 = Unit(
            name="Computer Architecture",
            description="Encrypt coursework very hard",
            unit_code="COMS10015",
            colour="343434",
            programme_id=y1_24_25.id,
        )
        comp_arch_2025_2026 = Unit(
            name="Computer Architecture",
            description="Encrypt coursework very hard",
            unit_code="COMS10015",
            colour="343434",
            programme_id=y1_25_26.id,
        )
        imp_func_2024_2025 = Unit(
            name="Imperative and Functional Programming",
            description="malloc() and memory leaks",
            unit_code="COMS10016",
            colour="565656",
            programme_id=y1_24_25.id,
        )
        imp_func_2025_2026 = Unit(
            name="Imperative and Functional Programming",
            description="malloc() and memory leaks",
            unit_code="COMS10016",
            colour="565656",
            programme_id=y1_25_26.id,
        )

        # YEAR 2 UNITS
        sep_2025_2026 = Unit(
            name="Software Engineering Project",
            description="Agile agile agile",
            unit_code="COMS20006",
            colour="112233",
            programme_id=y2_25_26.id,
        )
        plc_2025_2026 = Unit(
            name="Programming Languages and Computation",
            description="Very hard unit",
            unit_code="COMS20007",
            colour="454545",
            programme_id=y2_25_26.id,
        )
        csa_2025_2026 = Unit(
            name="Computer Systems A",
            description="Go go go go go & Game of Life",
            unit_code="COMS20017",
            colour="676767",
            programme_id=y2_25_26.id,
        )

        session.add_all([
            maths_for_cs_a_2024_2025,
            maths_for_cs_a_2025_2026,
            comp_arch_2024_2025,
            comp_arch_2025_2026,
            imp_func_2024_2025,
            imp_func_2025_2026,
            sep_2025_2026,
            plc_2025_2026,
            csa_2025_2026
        ])
        session.commit()
        session.refresh(maths_for_cs_a_2024_2025)
        session.refresh(maths_for_cs_a_2025_2026)
        session.refresh(comp_arch_2024_2025)
        session.refresh(comp_arch_2025_2026)
        session.refresh(imp_func_2024_2025)
        session.refresh(imp_func_2025_2026)
        session.refresh(sep_2025_2026)
        session.refresh(plc_2025_2026)
        session.refresh(csa_2025_2026)

        # create courseworks
        coursework1 = Coursework(
            name="Power to the People in 2024",
            description="Easy Haskell 1",
            unit_id=imp_func_2024_2025.id,
            due_date=datetime.datetime(2024, 12, 15, 23, 59),
            colour="676767",
        )
        coursework2 = Coursework(
            name="Power to the People in 2025",
            description="Easy Haskell 1",
            unit_id=imp_func_2025_2026.id,
            due_date=datetime.datetime(2025, 12, 15, 23, 59),
            colour="abcdef",
        )
        coursework3 = Coursework(
            name="Double Linked List 2024",
            description="literally the title",
            unit_id=imp_func_2024_2025.id,
            due_date=datetime.datetime(2024, 10, 30, 23, 59),
            colour="b01c2e",
        )
        coursework4 = Coursework(
            name="AI Bill Splitter",
            description="Splitvise but with Vibes, should have been called splitvibes",
            unit_id=sep_2025_2026.id,
            due_date=datetime.datetime(2026, 4, 20, 17, 00),
            colour="f1d2c3",
        )
        coursework5 = Coursework(
            name="Encrypt",
            description="Did you know you can encrypt with binary?",
            unit_id=comp_arch_2025_2026.id,
            due_date=datetime.datetime(2026, 5, 10, 14, 00),
            colour="1a2b3c",
        )
        coursework6 = Coursework(
            name="Encrypt",
            description="Did you know you can encrypt with binary? Includes v1 v2 v3",
            unit_id=comp_arch_2024_2025.id,
            due_date=datetime.datetime(2024, 11, 10, 14, 00),
            colour="1a2b3c",
        )
        session.add_all([coursework1, coursework2, coursework3, coursework4, coursework5, coursework6])
        session.commit()

        # Set user relationships
        # set user ids here

        # YEAR 1 students
        # i.e. not in year 2, only year 1, has 2025/2026 year 1 units only
        rohan="xaegpXv0lUvOsYsjugz7g8zjrzCHiI60"
        charles="VLQvrE4gwqC9JGjE1uJNIVUUxcqt7cQ3"

        # YEAR 2 students
        # have 2025/2026 year 2 units and 2024/2025 year 1
        josh="ZKT8bk57VK62LD6dxV2EgJasOfUDAidy"
        jack="3w5k7h8ajrAownl24CAhDG3EOnleWpAA"

        # lecturers
        # imp and func
        tilo="w2sHUIT6tdX4BI5nWL5LnRMjf0K9NYix"
        # maths a 2024
        david="972ac4ugeobSVJMXtnA6kg5gjjdVnChj"
        # maths a 2025, plc 2025
        eddie="Oa2fXEbuOLX1ppSLNzcHopSn1tvYgTNo"
        # comp arch 2024 2025
        dan="cVliv2WYp49VHTX8P4NfNHU74ZhBNwzW"
        # sep 2025
        sarah="JuP6rqIofgOwoEQQARdNRLJQ6htc6zea"
        # plc 2025
        steven="IFvdr1GBzO6SCOiPswaPpHznqbeSOlnw"
        # csa 2025
        sion ="4xgSUVKUjrBgLBV5TYNtNxCEjNyQO8M1"

        #rohan
        session.add_all([
            # year 1 in 2025
            UnitEnrollment(
                unit_id=maths_for_cs_a_2025_2026.id,
                user_id=rohan
            ),
            UnitEnrollment(
                unit_id=comp_arch_2025_2026.id,
                user_id=rohan
            ),
            UnitEnrollment(
                unit_id=imp_func_2025_2026.id,
                user_id=rohan
            ),
            UnitEnrollment(
                unit_id=maths_for_cs_a_2025_2026.id,
                user_id=charles
            ),
            UnitEnrollment(
                unit_id=comp_arch_2025_2026.id,
                user_id=charles
            ),
            UnitEnrollment(
                unit_id=imp_func_2025_2026.id,
                user_id=charles
            ),
            # year 1 in 2024, year 2 in 2025
            UnitEnrollment(
                unit_id=maths_for_cs_a_2024_2025.id,
                user_id=josh
            ),
            UnitEnrollment(
                unit_id=comp_arch_2024_2025.id,
                user_id=josh
            ),
            UnitEnrollment(
                unit_id=imp_func_2024_2025.id,
                user_id=josh
            ),
            UnitEnrollment(
                unit_id=sep_2025_2026.id,
                user_id=josh
            ),
            UnitEnrollment(
                unit_id=plc_2025_2026.id,
                user_id=josh
            ),
            UnitEnrollment(
                unit_id=csa_2025_2026.id,
                user_id=josh
            ),
            UnitEnrollment(
                unit_id=maths_for_cs_a_2024_2025.id,
                user_id=jack
            ),
            UnitEnrollment(
                unit_id=comp_arch_2024_2025.id,
                user_id=jack
            ),
            UnitEnrollment(
                unit_id=imp_func_2024_2025.id,
                user_id=jack
            ),
            UnitEnrollment(
                unit_id=sep_2025_2026.id,
                user_id=jack
            ),
            UnitEnrollment(
                unit_id=plc_2025_2026.id,
                user_id=jack
            ),
            UnitEnrollment(
                unit_id=csa_2025_2026.id,
                user_id=jack
            ),
            # lecturers
            UnitEnrollment(
                unit_id=imp_func_2024_2025.id,
                user_id=tilo,
                type="lecturer"
            ),
            UnitEnrollment(
                unit_id=imp_func_2025_2026.id,
                user_id=tilo,
                type="lecturer"
            ),
            UnitEnrollment(
                unit_id=maths_for_cs_a_2024_2025.id,
                user_id=david,
                type="lecturer"
            ),
            UnitEnrollment(
                unit_id=maths_for_cs_a_2025_2026.id,
                user_id=eddie,
                type="lecturer"
            ),
            UnitEnrollment(
                unit_id=plc_2025_2026.id,
                user_id=eddie,
                type="lecturer"
            ),
            UnitEnrollment(
                unit_id=comp_arch_2024_2025.id,
                user_id=dan,
                type="lecturer"
            ),
            UnitEnrollment(
                unit_id=comp_arch_2025_2026.id,
                user_id=dan,
                type="lecturer"
            ),
            UnitEnrollment(
                unit_id=sep_2025_2026.id,
                user_id=sarah,
                type="lecturer"
            ),
            UnitEnrollment(
                unit_id=plc_2025_2026.id,
                user_id=steven,
                type="lecturer"
            ),
            UnitEnrollment(
                unit_id=csa_2025_2026.id,
                user_id=sion,
                type="lecturer"
            )
        ])

        session.commit()
        print("Database seeded successfully")


SessionDep = Annotated[Session, Depends(get_session)]


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    print("yo yo")
    #seed_data()
    print("beep beep")
    yield
