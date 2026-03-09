from typing import Annotated, List
from uuid import UUID
from datetime import date

from pydantic import BaseModel, AfterValidator
from app.schemas.unit import UnitWithoutProgramme
import os


def is_valid_name(name: str) -> str:
    name = name.strip()
    if 1 <= len(name) <= 100:
        return name
    raise ValueError("Name must be between 1 and 100 characters")


def is_valid_date(value: date) -> date:
    if os.getenv("TESTING_MODE") == "True":
        return value
    today = date.today()

    if value <= today:
        raise ValueError("End date must be in the future")

    return value


# Can't test for end_date > start_date here as we don't have access to both fields in teh validator, so check in route handler (and create form on frontend inforces it anyway)

Name = Annotated[str, AfterValidator(is_valid_name)]
EndDate = Annotated[date, AfterValidator(is_valid_date)]


class ProgrammeCreate(BaseModel):
    name: Name
    start_date: date  # start date can be in teh past, if they forgot to make it before the programme started
    end_date: EndDate


class ProgrammeRead(
    BaseModel
):  # When reading, don't need to enforce any validation, just return what's in the DB
    id: UUID
    name: str
    start_date: date
    end_date: date
    units: list[UnitWithoutProgramme]


class ProgrammeUpdate(BaseModel):
    name: Name | None = None
    start_date: date | None = None
    end_date: EndDate | None = None


class ProgrammeDelete(BaseModel):
    id: UUID
    deletion_successful: bool


class ProgrammeAll(BaseModel):
    programmes: List[ProgrammeRead]
