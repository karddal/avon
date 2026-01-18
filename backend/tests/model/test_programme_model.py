from sqlmodel import SQLModel, Session, create_engine, select
from uuid import uuid4, UUID
from datetime import datetime, timedelta

from app.models.programme import Programme

# Testing that the model auto-populates the id field
def test_programme_auto_fields(session):
    start = datetime.today()
    end = start + timedelta(days=365)

    programme = Programme(name="Year 2026/2027", start_date=start, end_date=end)
    
    session.add(programme)
    session.commit()
    session.refresh(programme)

    assert isinstance(programme.id, UUID)