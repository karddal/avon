from uuid import UUID
from sqlmodel import SQLModel, Field

class UserGroupMember(SQLModel, table = True):
    group_id: int = Field(foreign_key="group.id", primary_key=True)
    unit_id: int = Field(foreign_key="unit.id", primary_key=True)
