from typing import Annotated
from uuid import UUID
from app.core.security import get_current_user
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.db.session import get_session
from app.schemas.unit_enrollment import TransferOwnerResponse, UnitEnrollmentOwner, UnitEnrollmentRead, UnitEnrollmentCreate, UnitEnrollmentBatchCreate, UnitEnrollmentDelete
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
def enroll_unit_batch_students(payload: UnitEnrollmentBatchCreate, session: session_dependency):
    if not session.get(Unit, payload.unit_id):
        raise HTTPException(status_code=404, detail="Unit not found")

    # find existing ones in bulk
    statement = select(UnitEnrollment.user_id).where(
        UnitEnrollment.unit_id == payload.unit_id
    )

    current_user_ids = session.exec(statement).all()
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

@router.post("/batch/lecturers", status_code=201)
def enroll_unit_batch_lecturers(payload: UnitEnrollmentBatchCreate, session: session_dependency):
    if not session.get(Unit, payload.unit_id):
        raise HTTPException(status_code=404, detail="Unit not found")

    # find existing ones in bulk
    statement = select(UnitEnrollment.user_id).where(
        UnitEnrollment.unit_id == payload.unit_id
    )

    current_user_ids = session.exec(statement).all()
    existing_user_ids = set(payload.user_ids) & set(current_user_ids)

    if existing_user_ids:
        raise HTTPException(
            status_code=409, 
            detail="Some users are already enrolled!"
        )

    # create new ones in bulk
    new_enrollments = [
        UnitEnrollment(unit_id=payload.unit_id, user_id=user_id, type="lecturer")
        for user_id in payload.user_ids
    ]
    
    session.add_all(new_enrollments)
    session.commit()
    
    return {"message": f"{len(new_enrollments)} users enrolled successfully"}
        
# owner

@router.get("/{unit_id}/owner", status_code=200)
def get_owner_of_unit(unit_id: UUID, session: session_dependency):
    stmt = select(UnitEnrollment).where(
        UnitEnrollment.unit_id == unit_id,
        UnitEnrollment.type == "owner"
    )
    owner_enrollment = session.exec(stmt).one_or_none()
    
    if not owner_enrollment:
        raise HTTPException(status_code=404, detail="No owner found for this unit")
    
    return owner_enrollment.user_id

@router.post("/{unit_id}/owner", status_code=201)
def add_owner_to_unit(
    unit_id: UUID, 
    owner_data: UnitEnrollmentOwner,
    session: session_dependency
):
    # Check if an owner already exists
    existing_owner_stmt = select(UnitEnrollment).where(
        UnitEnrollment.unit_id == unit_id,
        UnitEnrollment.type == "owner"
    )
    existing_owner = session.exec(existing_owner_stmt)
    
    if existing_owner:
        raise HTTPException(
            status_code=400, 
            detail="This unit already has an owner"
        )
    
    # Create new owner
    new_owner = UnitEnrollment(
        unit_id=unit_id,
        user_id=UUID(owner_data.user_id),
        role="owner"
    )
    
    session.add(new_owner)
    session.commit()
    session.refresh(new_owner)
    
    return new_owner

@router.put("/{unit_id}/transfer_owner", status_code=200, response_model=TransferOwnerResponse)
def transfer_owner(
    unit_id: UUID, 
    owner_data: UnitEnrollmentOwner, 
    session: session_dependency, 
    me: str = Depends(get_current_user)
):
    current_owner_stmt = select(UnitEnrollment).where(
        UnitEnrollment.unit_id == unit_id,
        UnitEnrollment.user_id == me,
        UnitEnrollment.type == "owner"
    )
    current_owner = session.exec(current_owner_stmt).one_or_none()
    
    if not current_owner:
        raise HTTPException(
            status_code=403, 
            detail="You are not the owner of this unit!"
        )
    
    new_user_enrollment_stmt = select(UnitEnrollment).where(
        UnitEnrollment.unit_id == unit_id,
        UnitEnrollment.user_id == owner_data.user_id
    )
    new_user_enrollment = session.exec(new_user_enrollment_stmt).one_or_none()
    
    current_owner.type = "lecturer"
    
    if new_user_enrollment:
        new_user_enrollment.type = "owner"
    else:
        new_owner = UnitEnrollment(
            unit_id=unit_id,
            user_id=owner_data.user_id,
            role="owner"
        )
        session.add(new_owner)
    
    session.commit()
    
    return TransferOwnerResponse(
        message="Ownership transferred successfully",
        previous_owner=me,
        new_owner=owner_data.user_id
    )
