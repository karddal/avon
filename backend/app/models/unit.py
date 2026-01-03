import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

from pydantic import validator, field_validator, model_validator
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from programme import Programme

class Unit(SQLModel, table=True):
    id: uuid.UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    name: str = Field(index=True)
    description: str = Field(index=True)
    creation_date: datetime = Field(default_factory=datetime.now)
    unit_code: str = Field(index=True)
    colour: str = Field()
    programme_id: uuid.UUID | None = Field(foreign_key="programme.id", ondelete="CASCADE")
    programme: Optional["Programme"] = Relationship(back_populates="units")
    start_date: date | None = Field()
    end_date: date | None = Field()

    @model_validator(mode="before")
    @classmethod
    def check_mutually_exclusive(cls, values):
        programme, start_date, end_date = (
            values.get("programme"),
            values.get("start_date"),
            values.get("end_date"),
        )
        if programme is not None:
            # then start_date and end_date must be none
            if start_date is None and end_date is None:
                return values
            else:
                raise ValueError(
                    "Start date, end date and programme are mutually exclusive"
                )
        else:
            # then start_date end end date must not be none
            if start_date is None and end_date is None:
                raise ValueError(
                    "Start date, end date and programme are mutually exclusive"
                )
            else:
                return values
