from contextlib import asynccontextmanager
import datetime
from typing import Annotated

from fastapi import Depends, FastAPI
from sqlmodel import Session, SQLModel, create_engine, select

from app.models.coursework import Coursework
from app.models.unit import Unit
from app.models.unit_enrollement import UnitEnrollment
from app.models.unit_group import UnitGroup
from app.models.user import User
from app.models.user_group_member import UserGroupMember

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

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
        # Get Units
        statement = select(Unit)
        unit_result = session.exec(statement).first()
        # Populate the Units Page if empty
        if not unit_result:
            unit1 = Unit(name="Algorithms and Data", description="hard unit")
            unit2 = Unit(name="Software Engineering Project", description="lots of work")
            unit3 = Unit(name="Imperative and Functional Programming", description="haskell was enlightening")
            unit4 = Unit(name="Computer Architecture", description="second part was very fun")
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
                due_date=datetime.datetime(2025, 12, 15, 23, 59)
            )
            coursework2 = Coursework(
                name="Double Linked List",
                description="literally the title",
                unit_id=unit3.id,
                due_date=datetime.datetime(2025, 11, 30, 23, 59)
            )
            coursework3 = Coursework(
                name="AI Bill Splitter",
                description="Splitvise but with Vibes, should have been called splitvibes",
                unit_id=unit2.id,
                due_date=datetime.datetime(2025, 11, 20, 17, 00)
            )
            coursework4 = Coursework(
                name="Encrypt",
                description="Did you know you can encrypt with binary?",
                unit_id=unit4.id,
                due_date=datetime.datetime(2025, 12, 10, 14, 00)
            )
            session.add_all([coursework1, coursework2, coursework3, coursework4])
            session.commit()
        
        # Get user
        statement = select(User)
        user_result = session.exec(statement).first()  # Changed from Session.exec
        if not user_result:
            user1 = User(
                first_name="Hrushikesh",
                last_name="Emkay",
                email="rsh@bristol.ac.uk",
                hashed_password="$2b$12$hashedpassword1",
                is_lecturer=False
            )
            user2 = User(
                first_name="Josh Jenkins",
                last_name="Jenkins",
                email="j.jenkins@bristol.ac.uk",
                hashed_password="$2b$12$hashedpassword2",
                is_lecturer=False
            )
            user3 = User(
                first_name="Yuxuan",
                last_name="Wang",
                email="yuxuan.wang@university.ac.uk",
                hashed_password="$2b$12$hashedpassword3",
                is_lecturer=False
            )
            user4 = User(
                first_name="Dempsey",
                last_name="Jack",
                email="jwd@university.ac.uk",
                hashed_password="$2b$12$hashedpassword4",
                is_lecturer=False
            )
            user5 = User(
                first_name="Mihaly",
                last_name="Toth-Tarsoly",
                email="mihaly@university.ac.uk",  # Fixed duplicate email
                hashed_password="$2b$12$hashedpassword5",
                is_lecturer=False
            )
            user6 = User(
                first_name="Tilo",
                last_name="Burghardt",
                email="tilo@university.ac.uk",
                hashed_password="$2b$12$hashedpassword6",  # Changed password hash
                is_lecturer=True
            )
            session.add_all([user1, user2, user3, user4, user5, user6])
            session.commit()
            session.refresh(user1)
            session.refresh(user2)
            session.refresh(user3)
            session.refresh(user4)
            session.refresh(user5)
            session.refresh(user6)
        else:
            # If users already exist, fetch them
            users = session.exec(select(User)).all()
            user1, user2, user3, user4, user5, user6 = users[0], users[1], users[2], users[3], users[4], users[5]
        
        statement = select(UnitEnrollment)
        unit_enrollment_data = session.exec(statement).first()
        if not unit_enrollment_data:
            enrollment1 = UnitEnrollment(unit_id=unit1.id, user_id=user1.id)
            enrollment2 = UnitEnrollment(unit_id=unit2.id, user_id=user1.id)
            enrollment3 = UnitEnrollment(unit_id=unit3.id, user_id=user1.id)
            enrollment4 = UnitEnrollment(unit_id=unit4.id, user_id=user1.id)
            
            enrollment5 = UnitEnrollment(unit_id=unit1.id, user_id=user2.id)
            enrollment6 = UnitEnrollment(unit_id=unit2.id, user_id=user2.id)
            enrollment7 = UnitEnrollment(unit_id=unit3.id, user_id=user2.id)
            
            enrollment8 = UnitEnrollment(unit_id=unit1.id, user_id=user3.id)
            enrollment9 = UnitEnrollment(unit_id=unit4.id, user_id=user3.id)
            
            enrollment10 = UnitEnrollment(unit_id=unit1.id, user_id=user6.id)
            enrollment11 = UnitEnrollment(unit_id=unit2.id, user_id=user6.id)
            enrollment12 = UnitEnrollment(unit_id=unit3.id, user_id=user6.id)
            enrollment13 = UnitEnrollment(unit_id=unit4.id, user_id=user6.id)
            
            session.add_all([
                enrollment1, enrollment2, enrollment3, enrollment4,
                enrollment5, enrollment6, enrollment7, enrollment8,
                enrollment9, enrollment10, enrollment11, enrollment12, enrollment13
            ])
            session.commit()
        
        statement = select(UnitGroup)
        unit_group_data = session.exec(statement).first()
        if not unit_group_data:
            group1 = UnitGroup(
                name="Year 1 Computer Science",
                academic_year=2025
            )
            group2 = UnitGroup(
                name="Year 2 Computer Science",
                academic_year=2024
            )
            group3 = UnitGroup(
                name="Year 3 Computer Science",
                academic_year=2023
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
        
        statement = select(UserGroupMember)
        data = session.exec(statement).first()  # Changed from Session.exec
        if not data:
            ugm1 = UserGroupMember(group_id=group1.id, unit_id=unit3.id)
            ugm2 = UserGroupMember(group_id=group1.id, unit_id=unit4.id)
            
            ugm3 = UserGroupMember(group_id=group2.id, unit_id=unit1.id)
            ugm4 = UserGroupMember(group_id=group2.id, unit_id=unit2.id)
            
            ugm5 = UserGroupMember(group_id=group3.id, unit_id=unit1.id)
            ugm6 = UserGroupMember(group_id=group3.id, unit_id=unit2.id)
            ugm7 = UserGroupMember(group_id=group3.id, unit_id=unit3.id)
            ugm8 = UserGroupMember(group_id=group3.id, unit_id=unit4.id)
            
            session.add_all([ugm1, ugm2, ugm3, ugm4, ugm5, ugm6, ugm7, ugm8])
            session.commit()
        
        print("Database seeded successfully")

SessionDep = Annotated[Session, Depends(get_session)]

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    print("yo yo")
    seed_data()
    print("beep beep")
    yield

