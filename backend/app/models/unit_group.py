import uuid

from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID
from unit import Unit
from user_group_member import UserGroupMember
from typing import List

from app.core.types.academicYear import AcademicYear


class UnitGroup(SQLModel, table = True):
    id: UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    name: str = Field(index = True)
    academic_year: AcademicYear = Field(index = True)

    unit: List[Unit] = Relationship(
        back_populates="groups",
        link_model=UserGroupMember
    )

    