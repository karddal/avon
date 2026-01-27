from typing import Annotated
from uuid import UUID
from datetime import date

from pydantic import BaseModel, AfterValidator


def is_valid_name(name: str) -> str:
    name = name.strip()
    if 1 <= len(name) <= 100:
        return name
    raise ValueError("Name must be between 1 and 100 characters")


def is_valid_date(value: date) -> date:
    today = date.today()

    if value <= today:
        raise ValueError("Date must be in the future")

    return value

# Can't test for end_date > start_date here as we don't have access to both fields in teh validator, so check in route handler (and create form on frontend inforces it anyway)

Name = Annotated[str, AfterValidator(is_valid_name)]
StartDate = Annotated[date, AfterValidator(is_valid_date)]
EndDate = Annotated[date, AfterValidator(is_valid_date)]

class ProgrammeCreate(BaseModel):
    name: Name
    start_date: StartDate
    end_date: EndDate


class ProgrammeRead(BaseModel):
    id: UUID
    name: Name
    start_date: StartDate
    end_date: EndDate
    units: list

class ProgrammeUpdate(BaseModel):
    name: Name | None = None
    start_date: StartDate | None = None
    end_date: EndDate | None = None

class ProgrammeDelete(BaseModel):
    id: UUID
    deletion_successful: bool
