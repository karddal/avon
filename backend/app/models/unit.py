import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List

from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from programme import Programme
    from unit_enrollment import UnitEnrollment
    from coursework import Coursework

class Unit(SQLModel, table=True):
    id: uuid.UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    name: str = Field(index=True)
    description: str = Field(index=True)
    creation_date: datetime = Field(default_factory=datetime.now)
    unit_code: str = Field(index=True)
    colour: str = Field()
    programme_id: uuid.UUID = Field(foreign_key="programme.id", ondelete="CASCADE")
    programme: "Programme" = Relationship(back_populates="units")
    enrollments: List["UnitEnrollment"] = Relationship(back_populates="unit")
    courseworks: List["Coursework"] = Relationship(back_populates="unit")