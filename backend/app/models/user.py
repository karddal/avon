import datetime
from typing import List, TYPE_CHECKING
import uuid

from sqlmodel import Relationship, SQLModel, Field
from uuid import UUID

if TYPE_CHECKING:
    from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment

class User(SQLModel, table = True):
    id: UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    first_name: str = Field(index = True)
    last_name: str = Field(index = True)
    email: str = Field(index = True)
    hashed_password: str = Field()
    creation_date: datetime.datetime = Field(default_factory = datetime.datetime.now)
    is_lecturer: bool = Field(default = False)

    units: List["Unit"] = Relationship(
        back_populates="users",
        link_model=UnitEnrollment
    )
# class Lecturer(User, table = True):
#
# class Student(User, table = True):
