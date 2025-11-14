from uuid import UUID
from sqlmodel import SQLModel, Field

class UnitGroupMember(SQLModel, table = True):
    group_id: UUID = Field(foreign_key="unitgroup.id", primary_key=True)
    unit_id: UUID = Field(foreign_key="unit.id", primary_key=True)

    