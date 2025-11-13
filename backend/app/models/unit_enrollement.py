
from uuid import UUID
from sqlmodel import SQLModel, Field

class UnitEnrollment(SQLModel, table = True):
    unit_id: UUID = Field(foreign_key="unit.id", primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", primary_key=True)
