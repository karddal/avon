from fastapi import HTTPException

from sqlmodel import Session
from app.models.unit import Unit

from app.models.unit_enrollment import UnitEnrollment, UserType
from app.schemas.unit_enrollment import UnitEnrollmentCreate

#create the unit enrollment
def create(session: Session, payload: UnitEnrollmentCreate) -> UnitEnrollment:
    if not session.get(Unit, payload.unit_id):
        raise HTTPException(status_code=404, detail="Unit not found")

    if session.get(UnitEnrollment, (payload.unit_id, payload.user_id)):
        raise HTTPException(status_code=409, detail="User already enrolled in this unit")

    try:
        _ = UserType(payload.user_type)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid user_type")

    enrollment = UnitEnrollment(
        unit_id=payload.unit_id,
        user_id=payload.user_id,
        user_type=payload.user_type,
    )

    session.add(enrollment)
    session.commit()
    session.refresh(enrollment)
    return enrollment