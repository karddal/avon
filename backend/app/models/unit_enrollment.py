from enum import Enum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, String

if TYPE_CHECKING:
    from app.models.unit import Unit

#type of user allowed
class UserType(str, Enum):
    lecturer = "lecturer"
    student = "student"

class UnitEnrollment(SQLModel, table = True):
    unit_id: UUID = Field(foreign_key="unit.id", primary_key=True)
    user_id: str = Field(primary_key=True)
    user_type: UserType = Field(default=UserType.student, sa_column=Column(String, nullable=False))
    unit: "Unit" = Relationship(back_populates="enrollments")