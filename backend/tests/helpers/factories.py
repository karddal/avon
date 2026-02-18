from sqlmodel import Session
from app.models.coursework import Coursework
from app.models.programme import Programme
from uuid import uuid4, UUID
from datetime import datetime, timedelta

from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment


def create_programme(session: Session):
    programme = Programme(id=uuid4(), name="Test Programme", start_date=datetime.now(),end_date=datetime.today() + timedelta(days=365), gitlab_id="123456")
    session.add(programme)
    session.commit()
    session.refresh(programme)

    return programme

def create_unit(session) -> Unit:
    programme = create_programme(session)
    unit_id = uuid4()
    unit = Unit(id=unit_id, name="Test Unit", description="Test description", unit_code="COMS20017", colour="abcdef", programme_id=programme.id, gitlab_id="123456")
    session.add(unit)
    session.commit()
    session.refresh(unit)

    return unit

def create_lecturers(session, unit_id) -> UnitEnrollment:
    user_id = str(uuid4())
    unit_enrollment = UnitEnrollment(unit_id=unit_id, user_id=user_id, type="lecturer")
    session.add(unit_enrollment)
    session.commit()
    return unit_enrollment

def create_students(session, unit_id) -> UnitEnrollment:
    user_id = str(uuid4())
    unit_enrollment = UnitEnrollment(unit_id=unit_id, user_id=user_id, type="student")
    session.add(unit_enrollment)
    session.commit()
    return unit_enrollment

def create_coursework(session, unit_id) -> Coursework:
    coursework_id = uuid4()
    coursework = Coursework(id=coursework_id, name="Test coursework", description="Test description", unit_id=unit_id, due_date=datetime.today() + timedelta(days=365), colour="abcdef", gitlab_id="123456")
    session.add(coursework)
    session.commit()
    return coursework