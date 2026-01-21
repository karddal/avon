from typing import Annotated
from uuid import UUID
from datetime import date

from pydantic import BaseModel, AfterValidator

def is_valid_name(name: str) -> str:
    name = name.strip()
    if 1 <= len(name) <= 100:
        return name
    raise ValueError("Name must be between 1 and 100 characters")


def is_valid_start_date(value: date) -> date:
    today = date.today()

    if value <= today:
        raise ValueError("Start date must be in the future")

    return value


Name = Annotated[str, AfterValidator(is_valid_name)]
StartDate = Annotated[date, AfterValidator(is_valid_start_date)]

class ProgrammeCreate(BaseModel):
    name: Name
    start_date: StartDate


class ProgrammeRead(BaseModel):
    id: UUID
    name: Name
    start_date: StartDate
    end_date: date
