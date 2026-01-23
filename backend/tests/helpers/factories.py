from sqlmodel import Session
from app.models.programme import Programme
from uuid import uuid4, UUID
from datetime import datetime, timedelta

from app.models.unit import Unit


def create_programme(session: Session):
    programme = Programme(id=uuid4(), name="Test Programme", start_date=datetime.now(),end_date=datetime.today() + timedelta(days=365))
    session.add(programme)
    session.commit()
    session.refresh(programme)

    return programme

def create_unit(session) -> UUID:
    programme = create_programme(session)
    unit_id = uuid4()
    unit = Unit(id=unit_id, name="Test Unit", description="Test description", unit_code="COMS20017", colour="abcdef", programme_id=programme.id,)
    session.add(unit)
    session.commit()
    session.refresh(unit)

    return unit_id