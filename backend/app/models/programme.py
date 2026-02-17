import uuid
from datetime import date
from typing import TYPE_CHECKING, List

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from unit import Unit


class Programme(SQLModel, table=True):
    id: uuid.UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    name: str = Field(nullable=False)
    start_date: date = Field(nullable=False)
    end_date: date = Field(nullable=False)
    gitlab_id: str = Field(nullable=False)
    units: List["Unit"] = Relationship(back_populates="programme", cascade_delete=True)
