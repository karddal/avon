from typing import Annotated, List, Literal

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
EnrollmentType = Annotated[Literal["lecturer", "student", "owner"], AfterValidator(is_valid_enrollment_type)]

class UnitEnrollmentRead(BaseModel):
    unit_id : UUID
    user_id : str
    type : str

class UnitEnrollmentCreate(BaseModel):
    unit_id: UUID
    user_id: UserId
    type: EnrollmentType = "student"
    model_config = ConfigDict(extra="forbid")

class UnitEnrollmentUpdate(BaseModel):
    type : EnrollmentType

class UnitEnrollmentDelete(BaseModel):
    unit_id: UUID
    user_id: str

class UnitEnrollmentBatchCreate(BaseModel):
    unit_id: UUID
    user_ids: List[UserId]

class UnitEnrollmentOwner(BaseModel):
    user_id: str

class TransferOwnerResponse(BaseModel):
    message: str
    previous_owner: str
    new_owner: str