from contextlib import asynccontextmanager
import datetime
from typing import Annotated

from fastapi import Depends, FastAPI
from sqlmodel import Session, SQLModel, create_engine, select

from app.models.coursework import Coursework
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment
from app.models.unit_group import UnitGroup
from dotenv import load_dotenv
import os

if os.getenv("ENV") == "dev":
    env_file = ".env.dev"
    load_dotenv(dotenv_path=env_file)

db_url = os.getenv("DATABASE_URL")
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
    print("hello")
    with Session(engine) as session:

        statement = select(UnitGroup)
        unit_group_data = session.exec(statement).first()
        if not unit_group_data:
            group1 = UnitGroup(
                name="Year 1 Computer Science",
                academic_year=2025,
                units=[]
            )
            group2 = UnitGroup(
                name="Year 2 Computer Science",
                academic_year=2024,
                units=[]
            )
            group3 = UnitGroup(
                name="Year 3 Computer Science",
                academic_year=2023,
                units=[]
            )
            session.add_all([group1, group2, group3])  # Added this line
            session.commit()  # Added this line
            session.refresh(group1)  # Added this line
            session.refresh(group2)  # Added this line
            session.refresh(group3)  # Added this line
        else:
            # If groups already exist, fetch them
            groups = session.exec(select(UnitGroup)).all()
            group1, group2, group3 = groups[0], groups[1], groups[2]
        
        # Get Units
        statement = select(Unit)
        unit_result = session.exec(statement).first()
        # Populate the Units Page if empty
        if not unit_result:
            unit1 = Unit(name="Algorithms and Data", description="hard unit", unit_code="COMS20017",colour="abcdef", groups=[group1, group2, group3], users=[], academic_year=2025)
            unit2 = Unit(name="Software Engineering Project", description="lots of work", unit_code="COMS20006",colour="b01c2e", groups=[group1, group2, group3], users=[], academic_year=2025)
            unit3 = Unit(name="Imperative and Functional Programming", description="haskell was enlightening",unit_code="COMS10016",colour="f1d2c3", groups=[group1, group2, group3], users=[], academic_year=2025)
            unit4 = Unit(name="Computer Architecture", description="second part was very fun",unit_code="COMS10015",colour="1a2b3c", groups=[group1, group2, group3], users=[], academic_year=2025)
            session.add_all([unit1, unit2, unit3, unit4])
            session.commit()
            session.refresh(unit1)
            session.refresh(unit2)
            session.refresh(unit3)
            session.refresh(unit4)
        else:
            # If units already exist, fetch them so we can use them later
            units = session.exec(select(Unit)).all()
            unit1, unit2, unit3, unit4 = units[0], units[1], units[2], units[3]
        
        # Get Coursework
        statement = select(Coursework)
        coursework_result = session.exec(statement).first()  # Changed from Session.exec
        if not coursework_result:
            coursework1 = Coursework(
                name="Power to the People",
                description="Easy Haskell 1",
                unit_id=unit3.id,
                due_date=datetime.datetime(2025, 12, 15, 23, 59),
                colour="abcdef"
            )
            coursework2 = Coursework(
                name="Double Linked List",
                description="literally the title",
                unit_id=unit3.id,
                due_date=datetime.datetime(2025, 11, 30, 23, 59),
                colour="b01c2e"
            )
            coursework3 = Coursework(
                name="AI Bill Splitter",
                description="Splitvise but with Vibes, should have been called splitvibes",
                unit_id=unit2.id,
                due_date=datetime.datetime(2025, 11, 20, 17, 00),
                colour="f1d2c3"
            )
            coursework4 = Coursework(
                name="Encrypt",
                description="Did you know you can encrypt with binary?",
                unit_id=unit4.id,
                due_date=datetime.datetime(2025, 12, 10, 14, 00),
                colour="1a2b3c"
            )
            session.add_all([coursework1, coursework2, coursework3, coursework4])
            session.commit()
        
        # Get user
        statement = select(UnitEnrollment)
        unit_enrollment_data = session.exec(statement).first()
        if not unit_enrollment_data:
            enrollment1 = UnitEnrollment(unit_id=unit1.id, user_id="Iu8NEUz0Q5DyhpeNAACCv397QYXEcxqd")
            enrollment2 = UnitEnrollment(unit_id=unit2.id, user_id="Iu8NEUz0Q5DyhpeNAACCv397QYXEcxqd")
            enrollment3 = UnitEnrollment(unit_id=unit3.id, user_id="Iu8NEUz0Q5DyhpeNAACCv397QYXEcxqd")
            enrollment4 = UnitEnrollment(unit_id=unit4.id, user_id="Iu8NEUz0Q5DyhpeNAACCv397QYXEcxqd")
            
            enrollment5 = UnitEnrollment(unit_id=unit1.id, user_id="P4uY6u3aG68to2ePrOcC48XuwCs3vOHO")
            enrollment6 = UnitEnrollment(unit_id=unit2.id, user_id="P4uY6u3aG68to2ePrOcC48XuwCs3vOHO")
            enrollment7 = UnitEnrollment(unit_id=unit3.id, user_id="P4uY6u3aG68to2ePrOcC48XuwCs3vOHO")
            
            enrollment8 = UnitEnrollment(unit_id=unit1.id, user_id="fRMZiXJl6xiEWz1PzJwUYHiSGG5dJlAW")
            enrollment9 = UnitEnrollment(unit_id=unit4.id, user_id="fRMZiXJl6xiEWz1PzJwUYHiSGG5dJlAW")
            
            enrollment10 = UnitEnrollment(unit_id=unit1.id, user_id="yH57Fn6QVfByFaEmBC15ydxpNBYz17D4")
            enrollment11 = UnitEnrollment(unit_id=unit2.id, user_id="yH57Fn6QVfByFaEmBC15ydxpNBYz17D4")
            enrollment12 = UnitEnrollment(unit_id=unit3.id, user_id="yH57Fn6QVfByFaEmBC15ydxpNBYz17D4")
            enrollment13 = UnitEnrollment(unit_id=unit4.id, user_id="yH57Fn6QVfByFaEmBC15ydxpNBYz17D4")
            
            session.add_all([
                enrollment1, enrollment2, enrollment3, enrollment4,
                enrollment5, enrollment6, enrollment7, enrollment8,
                enrollment9, enrollment10, enrollment11, enrollment12, enrollment13
            ])
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

