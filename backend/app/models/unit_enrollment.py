from typing import TYPE_CHECKING
from uuid import UUID
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.unit import Unit


class UnitEnrollment(SQLModel, table = True):
    unit_id: UUID = Field(foreign_key="unit.id", primary_key=True)
    user_id: str = Field(primary_key=True)
    unit: "Unit" = Relationship(back_populates="enrollments")