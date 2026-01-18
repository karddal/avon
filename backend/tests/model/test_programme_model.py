from sqlmodel import SQLModel, Session, create_engine, select
from uuid import uuid4, UUID
from datetime import datetime, timedelta, date
# Importing date to get a less precise time that reflects the model, and one that we can check is equal to the test value

from app.models.programme import Programme

# Testing that the model auto Populates the id field
def test_programme_auto_fields(session):
    start = date.today()
    end = start + timedelta(days=365)

    programme = Programme(name="Year 2026/2027", start_date=start, end_date=end)

    session.add(programme)
    session.commit()
    session.refresh(programme)

    assert isinstance(programme.id, UUID)

# Ensuring the data is availlable still
def test_programme_persists_properly(session):
    start = date.today()
    end = start + timedelta(days=365)
    programme_id = uuid4()

    programme = Programme(id=programme_id, name="Year 2026/2027", start_date=start, end_date=end)

    session.add(programme)
    session.commit()
    session.refresh(programme)
    retrieved = session.get(Programme, programme_id)

    assert retrieved.id == programme_id
    assert retrieved.name == "Year 2026/2027"
    assert retrieved.start_date == start
    assert retrieved.end_date == end