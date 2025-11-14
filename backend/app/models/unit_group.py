import uuid
from app.models.unit import Unit
from app.models.user_group_member import UserGroupMember
from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID
from typing import List



class UnitGroup(SQLModel, table = True):
    id: UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    name: str = Field(index = True)
    academic_year: int = Field(index = True)
