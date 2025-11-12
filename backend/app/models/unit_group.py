import uuid

from sqlmodel import SQLModel, Field
from uuid import UUID

from app.core.types.academicYear import AcademicYear


class UnitGroup(SQLModel, table = True):
    id: UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    name: str = Field(index = True)
    academic_year: AcademicYear = Field(index = True)