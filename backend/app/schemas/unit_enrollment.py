from typing import Annotated, Literal

from pydantic import BaseModel, AfterValidator, ConfigDict
from uuid import UUID

def is_valid_user_id(user_id: str) -> str:
    user_id = user_id.strip()
    if not user_id:
        raise ValueError("user_id can not be empty")

    return user_id

def is_valid_enrollment_type(type: str) -> str:
    if type not in ("lecturer", "student"):
        raise ValueError("type must be 'lecturer' or 'student'")

    return type

UserId = Annotated[str, AfterValidator(is_valid_user_id)]
EnrollmentType = Annotated[Literal["lecturer", "student"], AfterValidator(is_valid_enrollment_type)]

class UnitEnrollmentRead(BaseModel):
    unit_id : UUID
    user_id : str
    user_type : str

class UnitEnrollmentCreate(BaseModel):
    unit_id: UUID
    user_id: UserId
    user_type: EnrollmentType = "student"
    model_config = ConfigDict(extra="forbid")

class UnitEnrollmentUpdate(BaseModel):
    user_type : EnrollmentType

class UnitEnrollmentDelete(BaseModel):
    unit_id: UUID
    user_id: str