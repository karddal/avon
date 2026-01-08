import pytest
from sqlmodel import SQLModel, Session, create_engine, select
from uuid import uuid4, UUID
from datetime import datetime, timedelta

from app.models.coursework import Coursework
from app.models.unit import Unit
from app.models.programme import Programme
from app.models.unit_enrollment import UnitEnrollment


# Helper Funcs:
def create_unit_with_programme(session) -> UUID:
    programme = Programme(id=uuid4(), name="Test Programme",start_date=datetime.now(), end_date=datetime.today() + timedelta(days=365))
    session.add(programme)
    session.commit()
    unit_id = uuid4()
    unit = Unit(id=unit_id, name="Test Unit", description="Test description", unit_code="COMS20017", colour="abcdef", programme_id=programme.id,)
    session.add(unit)
    session.commit()

    return unit_id

def coursework_payload(unit_id):
    return {
        "name": "Haskell 2",
        "description": "Func language courseowrk in haskell",
        "unit_id": unit_id,
        "due_date": (datetime.now() + timedelta(days=11)).isoformat(),
        "colour": "abcdef",
    }



def test_coursework_create_success(client, session):
    unit_id = create_unit_with_programme(session)

    payload = coursework_payload(str(unit_id)) # For some reason wants it in string form
    response = client.post("/coursework/create", json=payload)

    assert response.status_code == 201
    data = response.json()

    # Checks
    assert data["name"] == payload["name"]
    assert data["unit_id"] == payload["unit_id"]
    assert "id" in data
