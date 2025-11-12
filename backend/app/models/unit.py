import datetime
import uuid

from typing import List
from app.models.unit_group import UnitGroup
from app.models.user_group_member import UserGroupMember
from sqlmodel import SQLModel, Field, Relationship


class Unit(SQLModel, table=True):
    id: uuid.UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    name: str = Field(index = True)
    description: str = Field(index = True)
    creation_date: datetime.datetime = Field(default_factory=datetime.datetime.now)

    groups: List[UnitGroup] = Relationship(
        back_populates="units",
        link_model=UserGroupMember
    )
