
import pytest
from pydantic import ValidationError
from sqlmodel import SQLModel, Session, create_engine, select
from uuid import uuid4, UUID
from datetime import datetime, timedelta
from contextlib import nullcontext as does_not_raise
from app.models.programme import Programme
from app.models.unit import Unit
from app.schemas.unit import UnitCreate


def create_programme(session) -> UUID:
    programme = Programme(id=uuid4(), name="Test Programme",start_date=datetime.now(), end_date=datetime.today() + timedelta(days=365))
    session.add(programme)
    session.commit()
    # unit_id = uuid4()
    # unit = Unit(id=unit_id, name="Test Unit", description="Test description", unit_code="COMS20017", colour="abcdef", programme_id=programme.id,)
    # session.add(unit)
    # session.commit()

    return programme.id

def unit_payload(programme_id):
    return {
        "name":"Imperative and Functional Programming",
        "description":"Intro to coding",
        "unit_code":"COMS10015",
        "colour":"abcdef",
        "programme_id":programme_id
    }

# Tests to create units
def test_create_unit(client, session):
    programme_id = create_programme(session)
    payload = unit_payload(str(programme_id))

    response = client.post("/units/create", json=payload)
    assert response.status_code == 201
    # data = response.json




# Tests to get unit details
# Tests to get units with dates
# Tests to get the lecturers of the units
# Tests to update units
# Tests to delete units
# Tests to get units taken by a specific person
# Tests to get courseworks from a unit
# Tests to get all units