import uuid
from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID
from typing import List, TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.unit import Unit
from app.models.unit_group_member import UnitGroupMember

class UnitGroup(SQLModel, table = True):
    id: UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    name: str = Field(index = True)
    academic_year: int = Field(index = True)

    units: List["Unit"] = Relationship(
        back_populates="groups",
        link_model=UnitGroupMember
    )