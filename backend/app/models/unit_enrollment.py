from typing import TYPE_CHECKING, Literal
from uuid import UUID

from sqlalchemy import String
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.unit import Unit


class UnitEnrollment(SQLModel, table=True):
    unit_id: UUID = Field(foreign_key="unit.id", primary_key=True)
    user_id: str = Field(primary_key=True)
    type: Literal["lecturer", "student"] = Field(default="student", sa_type=String)
    unit: "Unit" = Relationship(back_populates="enrollments")
