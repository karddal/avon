import datetime
import uuid

from typing import List, TYPE_CHECKING

from app.models.unit_enrollment import UnitEnrollment
if TYPE_CHECKING:
    from app.models.user import User 
    from app.models.unit_group import UnitGroup
from app.models.unit_group_member import UnitGroupMember

from sqlmodel import SQLModel, Field, Relationship


class Unit(SQLModel, table=True):
    id: uuid.UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    name: str = Field(index = True)
    description: str = Field(index = True)
    creation_date: datetime.datetime = Field(default_factory=datetime.datetime.now)
    unit_code: str = Field(index=True)
    groups: List["UnitGroup"] = Relationship(
        back_populates="units",
        link_model=UnitGroupMember
    )

    users: List["User"] = Relationship(
        back_populates="units",
        link_model=UnitEnrollment
    )
