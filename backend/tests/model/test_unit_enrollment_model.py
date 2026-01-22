from sqlmodel import Session
from uuid import UUID

from tests.helpers.identities import test_user
from tests.helpers.factories import create_unit

from app.models.unit_enrollment import UnitEnrollment

def test_unit_enrollment_default_type(session: Session):
    unit_id = create_unit(session)

    enrollment = UnitEnrollment(unit_id = unit_id, user_id = test_user)
    session.add(enrollment)
    session.commit()
    session.refresh(enrollment)

    assert isinstance(enrollment.unit_id, UUID)
    assert enrollment.user_id == test_user
    assert enrollment.type == "student"

def test_unit_enrollment_get_by_composite_primary_key(session: Session):
    unit_id = create_unit(session)

    enrollment = UnitEnrollment(unit_id = unit_id, user_id = test_user, type = "lecturer")
    session.add(enrollment)
    session.commit()

    #refresh database
    session.expunge(enrollment)

    session_enrollment = session.get(UnitEnrollment, (unit_id, test_user))
    assert session_enrollment is not None
    assert session_enrollment.unit_id == unit_id
    assert session_enrollment.user_id == test_user