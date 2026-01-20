from fastapi import HTTPException

from sqlmodel import Session
from app.models.unit import Unit

from app.models.unit_enrollment import UnitEnrollment
from app.schemas.unit_enrollment import UnitEnrollmentCreate

#missing a user model
def create(session: Session, payload: UnitEnrollmentCreate) -> UnitEnrollment:
    if not session.get(Unit, payload.unit_id):
        raise HTTPException(status_code=404, detail="Unit not found")

    if not session.get(UnitEnrollment, (payload.unit_id, payload.user_id)):
        raise HTTPException(status_code=409, detail="User already enrolled in this unit")

    enrollment = UnitEnrollment(
        unit_id=payload.unit_id,
        user_id=payload.user_id,
        user_type=payload.type,
    )

    session.add(enrollment)
    session.commit()
    session.refresh(enrollment)
    return enrollment