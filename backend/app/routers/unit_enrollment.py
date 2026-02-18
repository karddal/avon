from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy import delete, not_
from sqlmodel import Session, select

from app.db.session import get_session
from app.schemas.unit_enrollment import UnitEnrollmentRead, UnitEnrollmentCreate, UnitEnrollmentBatchCreate, UnitEnrollmentBatchDelete, UnitEnrollmentDelete, UnitEnrollmentBatchTransfer
from fastapi import HTTPException

from app.models.unit import Unit

from app.models.unit_enrollment import UnitEnrollment

router = APIRouter(prefix="/unit_enrollment", tags=["unit_enrollment"])
session_dependency = Annotated[Session, Depends(get_session)]

@router.post("", response_model=UnitEnrollmentRead, status_code=201)
def enroll_unit(payload: UnitEnrollmentCreate, session: session_dependency):
    if not session.get(Unit, payload.unit_id):
        raise HTTPException(status_code=404, detail="Unit not found")

    if session.get(UnitEnrollment, (payload.unit_id, payload.user_id)):
        raise HTTPException(status_code=409, detail="User already enrolled in this unit")

    # try:
    #     _ = UserType(payload.user_type)
    # except ValueError:
    #     raise HTTPException(status_code=422, detail="Invalid user_type")

    enrollment = UnitEnrollment(
        unit_id=payload.unit_id,
        user_id=payload.user_id,
        type=payload.type,
    )

    session.add(enrollment)
    session.commit()
    session.refresh(enrollment)
    return enrollment

@router.delete("", status_code=201)
def delete_unit_enrollment(payload: UnitEnrollmentDelete, session: session_dependency):
    if not session.get(Unit, payload.unit_id):
        raise HTTPException(status_code=404, detail="Unit not found")

    find = session.get(UnitEnrollment, (payload.unit_id, payload.user_id))

    if not find:
        raise HTTPException(status_code=409, detail="User not enrolled in this unit")

    session.delete(find)
    session.commit()
    return {"message": "User enrollment deleted successfully"}

@router.post("/batch", status_code=201)
def enroll_unit_batch(payload: UnitEnrollmentBatchCreate, session: session_dependency):
    if not session.get(Unit, payload.unit_id):
        raise HTTPException(status_code=404, detail="Unit not found")

    # find existing ones in bulk
    statement = select(UnitEnrollment.user_id).where(
        UnitEnrollment.unit_id == payload.unit_id
    )

    current_user_ids = session.exec(statement).all()
    print(payload.unit_id, current_user_ids)
    existing_user_ids = set(payload.user_ids) & set(current_user_ids)

    if existing_user_ids:
        raise HTTPException(
            status_code=409, 
            detail="Some users are already enrolled!"
        )

    # create new ones in bulk
    new_enrollments = [
        UnitEnrollment(unit_id=payload.unit_id, user_id=user_id, type="student")
        for user_id in payload.user_ids
    ]
    
    session.add_all(new_enrollments)
    session.commit()
    
    return {"message": f"{len(new_enrollments)} users enrolled successfully"}

@router.delete("/batch", status_code=201)
def unenroll_unit(payload: UnitEnrollmentBatchDelete, session: session_dependency):
    if not session.get(Unit, payload.unit_id):
        raise HTTPException(status_code=404, detail="Unit not found")
    
    # find in bulk if they don't exist
    statement = select(UnitEnrollment.user_id).where(UnitEnrollment.unit_id == payload.unit_id)
    filteredStmt = select(UnitEnrollment.user_id).where(UnitEnrollment.user_id.notin_(payload.omitted_user_ids), UnitEnrollment.type == "student")

    exists = session.exec(filteredStmt.limit(1)).first()

    if not exists: # Want to check some people exist, to ensure consistency
        raise HTTPException(
            status_code=409, 
            detail=f"No Users are enrolled on given unit, that aren't excluded / omitted"
        )
    
    # unenroll in bulk, will just 
    delete_process = delete(UnitEnrollment).where(UnitEnrollment.user_id.in_(filteredStmt))

    session.exec(delete_process)
    session.commit()

    return {"message": "users un-enrolled successfully, excluding omitted "}

# @router.post("/batch/transfer", status_code=201)
# def transfer_unit_members(payload: UnitEnrollmentBatchTransfer, session: session_dependency):
#     if (not session.get(Unit, payload.unitIdsTo)) or (not )

