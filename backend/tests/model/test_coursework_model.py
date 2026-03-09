import pytest
from sqlmodel import select
from uuid import UUID
from datetime import datetime

from app.models.coursework import Coursework
from tests.helpers.factories import create_unit
# Need teh imports of all the models


# Testing that the model auto Populates the id and creation_date fields
def test_coursework_auto_fields(session):
    unit_id = create_unit(session).id

    due = datetime.now()
    cw = Coursework(
        name="Haskell 2",
        description="Coursework Description",
        unit_id=unit_id,
        due_date=due,
        colour="abcdef",
        gitlab_id="12345",
    )

    session.add(cw)
    session.commit()
    session.refresh(cw)

    assert isinstance(cw.id, UUID)
    assert cw.creation_date is not None
    assert isinstance(cw.creation_date, datetime)


# Ensuring the data is availlable still
def test_coursework_persists_properly(session):
    unit_id = create_unit(session).id

    due = datetime.now()
    cw = Coursework(
        name="Haskell 2",
        description="Coursework Description",
        unit_id=unit_id,
        due_date=due,
        colour="abcdef",
        gitlab_id="12345",
    )

    session.add(cw)
    session.commit()
    session.refresh(cw)
    retrieved = session.get(Coursework, cw.id)

    assert retrieved.name == "Haskell 2"
    assert retrieved.description == "Coursework Description"
    assert retrieved.unit_id == unit_id
    assert retrieved.due_date == due
    assert retrieved.colour == "abcdef"


# Testing that we can succseesfully query by unit_id
def test_coursework_query_by_unit_id(session):
    unit_id = create_unit(session).id

    due = datetime.now()
    cw = Coursework(
        name="Haskell 2",
        description="Coursework Description",
        unit_id=unit_id,
        due_date=due,
        colour="abcdef",
        gitlab_id="12345",
    )

    session.add(cw)
    session.commit()
    stmt = select(Coursework).where(Coursework.unit_id == unit_id)
    result = session.exec(stmt).first()

    assert result is not None
    assert result.unit_id == unit_id


# Testing we can update model correctly
def test_coursework_update(session):
    unit_id = create_unit(session).id

    due = datetime.now()
    cw = Coursework(
        name="Haskell 2",
        description="Coursework Description",
        unit_id=unit_id,
        due_date=due,
        colour="abcdef",
        gitlab_id="12345",
    )

    session.add(cw)
    session.commit()
    session.refresh(cw)
    cw.name = "Haskell 3"
    cw.description = "Coursework Description 3"
    session.add(cw)
    session.commit()
    session.refresh(cw)

    assert cw.name == "Haskell 3"
    assert cw.description == "Coursework Description 3"


# Testing we can successfuly delete a coursework
def test_coursework_delete(session):
    unit_id = create_unit(session).id

    due = datetime.now()
    cw = Coursework(
        name="Haskell 2",
        description="Coursework Description",
        unit_id=unit_id,
        due_date=due,
        colour="abcdef",
        gitlab_id="12345",
    )

    session.add(cw)
    session.commit()
    session.refresh(cw)

    session.delete(cw)
    session.commit()

    assert session.get(Coursework, cw.id) is None


# Make sure field types are correct
def test_coursework_field_types(session):
    unit_id = create_unit(session).id

    due = datetime.now()
    cw = Coursework(
        name="Haskell 2",
        description="Coursework Description",
        unit_id=unit_id,
        due_date=due,
        colour="abcdef",
        gitlab_id="12345",
    )

    session.add(cw)
    session.commit()
    session.refresh(cw)

    assert isinstance(cw.id, UUID)
    assert isinstance(cw.unit_id, UUID)
    assert isinstance(cw.due_date, datetime)
    assert isinstance(cw.colour, str)
