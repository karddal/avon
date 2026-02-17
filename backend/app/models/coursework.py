import datetime
import uuid
from typing import TYPE_CHECKING
from uuid import UUID
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.models.unit import Unit


class Coursework(SQLModel, table=True):
    id: UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    name: str = Field(index=True, nullable=False)
    description: str
    unit_id: UUID = Field(
        foreign_key="unit.id", index=True, ondelete="CASCADE"
    )  # links to the unit table, uses a foreign key (unit_id) corresponding to the primary key of the unit table (unit_id)
    unit: "Unit" = Relationship(back_populates="courseworks")
    due_date: datetime.datetime = Field(index=True)
    creation_date: datetime.datetime = Field(
        default_factory=datetime.datetime.now
    )  # note: this uses the timezome of the device, not a standard timezone like UTC (which we can't use as this is primarily a uk used program)
    colour: str
    gitlab_id: str = Field(nullable=False)
    template_id: int = Field(nullable=True)
