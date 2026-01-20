from typing import Annotated, Literal

from pydantic import BaseModel, AfterValidator
from uuid import UUID

def is_valid_user_id(user_id: str) -> str:
    user_id = user_id.strip()
    if not user_id:
        raise ValueError("user_id can not be empty")
    if 1 > len(user_id) > 100:
        raise ValueError("user id must be between 1 and 100 characters")

    return user_id

def is_valid_enrollment_type(type: str) -> str:
    if type not in ("lecturer", "student"):
        raise ValueError("type must be 'lecturer' or 'student'")

    return type

UserId = Annotated[str, AfterValidator(is_valid_user_id)]
EnrollmentType = Annotated[Literal["lecturer", "student"], AfterValidator(is_valid_enrollment_type)]

class UnitEnrollmentRead(BaseModel):
    unit : UUID
    user_id : str
    type : str

class UnitEnrollmentCreate(BaseModel):
    unit_id: UUID
    user_id: UserId
    type: EnrollmentType = "student"

class UnitEnrollmentUpdate(BaseModel):
    type : EnrollmentType

class UnitEnrollmentDelete(BaseModel):
    unit_id: UUID
    user_id: str