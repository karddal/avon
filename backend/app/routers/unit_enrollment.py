from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy import delete
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

@router.delete("/batch", status_code=201)
def unenroll_unit(payload: UnitEnrollmentBatchDelete, session: session_dependency):
    if not session.get(Unit, payload.unit_id):
        raise HTTPException(status_code=404, detail="Unit not found")
    
    # find in bulk if they don't exist
    stmt = select(UnitEnrollment.user_id).where(UnitEnrollment.unit_id == payload.unit_id, UnitEnrollment.type == "student", UnitEnrollment.user_id.notin_(payload.omitted_user_ids))

    students_to_remove = set(session.exec(stmt).all())

    if not students_to_remove: # Want to check some people exist, to ensure consistency
        raise HTTPException(
            status_code=409, 
            detail="No Users are enrolled on given unit, that aren't excluded / omitted"
        )
    
    # unenroll in bulk
    session.exec(delete(UnitEnrollment).where(UnitEnrollment.unit_id == payload.unit_id, UnitEnrollment.type == "student", UnitEnrollment.user_id.in_(students_to_remove)))
    session.commit()

    return {"message": "users un-enrolled successfully, excluding omitted "}

@router.post("/batch/transfer", status_code=201)
def transfer_unit_members(payload: UnitEnrollmentBatchTransfer, session: session_dependency):
    # Making sure teh unit to transfer from exists, and the units to transfer to exist
    if not session.get(Unit, payload.unitIdFrom):
        raise HTTPException(status_code=404, detail="Unit to delete from, not found")
    
    for unitToTransfer in payload.unitIdsTo:
        if not session.get(Unit, unitToTransfer):
            raise HTTPException(status_code=404, detail=f"Unit with id {unitToTransfer} not found")
    
    filtered_stmt = select(UnitEnrollment.user_id).where(
        UnitEnrollment.unit_id == payload.unitIdFrom,
        UnitEnrollment.user_id.notin_(payload.omittedMembers),
        UnitEnrollment.type == "student"
    )

    students_to_move = set(session.exec(filtered_stmt).all())

    if not students_to_move: # Want to check some people exist, to ensure consistency
        raise HTTPException(
            status_code=409, 
            detail="No Users are enrolled on given unit, that aren't excluded / omitted"
        )
    
    # unenroll in bulk
    session.exec(
        delete(UnitEnrollment).where(
            UnitEnrollment.unit_id == payload.unitIdFrom,
            UnitEnrollment.user_id.in_(students_to_move),
            UnitEnrollment.type == "student"
        )
    )

    
    for unit_to_transfer in payload.unitIdsTo:
        # Need to check the moving student isn't already enrolled in teh unit
        existsing_unit_members = select(UnitEnrollment.user_id).where(UnitEnrollment.unit_id == unit_to_transfer, UnitEnrollment.user_id.in_(students_to_move)) 
        existing_user_ids = set(session.exec(existsing_unit_members).all())
        
        new_user_ids = students_to_move - existing_user_ids # Only want to add people in the request that aren't alreday enrolled
        
        if new_user_ids:
            new_enrollments = [
                UnitEnrollment(unit_id=unit_to_transfer, user_id=user_id, type="student")
                for user_id in new_user_ids
            ]
            
            session.add_all(new_enrollments)
    
    session.commit()
    
    return {"message": "users transferred successfully"}
    
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
        
