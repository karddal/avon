import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List

from sqlmodel import Field, SQLModel, Relationship

from app.schemas.unit import CourseworkReadWithoutUnit
from app.models.colour import Colour

if TYPE_CHECKING:
    from programme import Programme
    from unit_enrollment import UnitEnrollment
    from coursework import Coursework

class Unit(SQLModel, table=True):
    id: uuid.UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    name: str = Field(index=True, min_length=1, max_length=100)
    description: str = Field(index=True, min_length=1, max_length=5000)
    creation_date: datetime = Field(default_factory=datetime.now)
    unit_code: str = Field(index=True)
    colour: Colour
    programme_id: uuid.UUID = Field(foreign_key="programme.id", ondelete="CASCADE")
    programme: "Programme" = Relationship(back_populates="units")
    enrollments: List["UnitEnrollment"] = Relationship(back_populates="unit",sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    courseworks: List["Coursework"] = Relationship(back_populates="unit",sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class UnitWithCourseworks(SQLModel):
    id: uuid.UUID
    unit_code: str
    name: str
    programme_start_date: datetime
    programme_end_date: datetime
    courseworks: List["CourseworkReadWithoutUnit"]

class UnitsWithCourseworks(SQLModel):
    units: List[UnitWithCourseworks]