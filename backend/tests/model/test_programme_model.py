from sqlmodel import SQLModel, Session, create_engine, select
from uuid import uuid4, UUID
from datetime import datetime, timedelta, date
# Importing date to get a less precise time that reflects the model, and one that we can check is equal to the test value

from app.models.programme import Programme


# Testing that the model auto Populates the id field
def test_programme_auto_fields(session):
    start = date.today()
    end = start + timedelta(days=365)

    programme = Programme(
        name="Year 2026/2027", start_date=start, end_date=end, gitlab_id="12345"
    )

    session.add(programme)
    session.commit()
    session.refresh(programme)

    assert isinstance(programme.id, UUID)


# Ensuring the data is availlable still
def test_programme_persists_properly(session):
    start = date.today()
    end = start + timedelta(days=365)
    programme_id = uuid4()

    programme = Programme(
        id=programme_id,
        name="Year 2026/2027",
        start_date=start,
        end_date=end,
        gitlab_id="12345",
    )

    session.add(programme)
    session.commit()
    session.refresh(programme)
    retrieved = session.get(Programme, programme_id)

    assert retrieved.id == programme_id
    assert retrieved.name == "Year 2026/2027"
    assert retrieved.start_date == start
    assert retrieved.end_date == end


# Testing that we can successfully query by programme_id
def test_programme_query_by_programme_id(session):
    start = date.today()
    end = start + timedelta(days=365)
    programme_id = uuid4()

    programme = Programme(
        id=programme_id,
        name="Year 2026/2027",
        start_date=start,
        end_date=end,
        gitlab_id="12345",
    )

    session.add(programme)
    session.commit()
    stmt = select(Programme).where(Programme.id == programme_id)
    result = session.exec(stmt).first()

    assert result is not None
    assert result.id == programme_id


# Testing we can update the model correctly
def test_programme_update(session):
    start = date.today()
    end = start + timedelta(days=365)
    programme_id = uuid4()

    programme = Programme(
        id=programme_id,
        name="Year 2026/2027",
        start_date=start,
        end_date=end,
        gitlab_id="12345",
    )

    session.add(programme)
    session.commit()
    session.refresh(programme)
    programme.name = "Year 2027/2028"
    session.add(programme)
    session.commit()
    session.refresh(programme)

    assert programme.name == "Year 2027/2028"


# Testing we can successfully delete a programme
def test_programme_delete(session):
    start = date.today()
    end = start + timedelta(days=365)
    programme_id = uuid4()

    programme = Programme(
        id=programme_id,
        name="Year 2026/2027",
        start_date=start,
        end_date=end,
        gitlab_id="12345",
    )

    session.add(programme)
    session.commit()
    session.refresh(programme)

    session.delete(programme)
    session.commit()

    assert session.get(Programme, programme.id) is None


# Make sure field types are correct
def test_programme_field_types(session):
    start = date.today()
    end = start + timedelta(days=365)
    programme_id = uuid4()

    programme = Programme(
        id=programme_id,
        name="Year 2026/2027",
        start_date=start,
        end_date=end,
        gitlab_id="12345",
    )

    session.add(programme)
    session.commit()
    session.refresh(programme)

    assert isinstance(programme.id, UUID)
    assert isinstance(programme.name, str)
    assert isinstance(programme.start_date, date)
    assert isinstance(programme.end_date, date)
