import uuid
from datetime import date, datetime
from typing import Annotated, List, Literal

from pydantic import AfterValidator, BaseModel

from app.models.programme import Programme


def name_is_correct_length(name: str) -> str:
    if 1 <= len(name) <= 72:
        return name
    else:
        raise ValueError("Name must be between 1 and 72 characters")


Name = Annotated[str, AfterValidator(name_is_correct_length)]


class ProgrammeUnitRead(BaseModel):
    name: Name
    description: str
    creation_date: datetime
    unit_code: str
    colour: str
    programme: Programme
    start_date: date
    end_date: date


class ProgrammeUnitCreate(BaseModel):
    type: Literal["programme"]
    name: Name
    description: str
    unit_code: str
    colour: str
    programme: uuid.UUID


class ProgrammeUnitUpdate(BaseModel):
    type: Literal["programme"]
    name: Name
    description: str
    unit_code: str
    colour: str
    programme: uuid.UUID


class StandaloneUnitRead(BaseModel):
    name: Name
    description: str
    creation_date: datetime
    unit_code: str
    colour: str
    programme: Programme


class StandaloneUnitCreate(BaseModel):
    type: Literal["standalone"]
    name: Name
    description: str
    unit_code: str
    colour: str
    start_date: date
    end_date: date


class StandaloneUnitUpdate(BaseModel):
    type: Literal["standalone"]
    name: Name
    description: str
    unit_code: str
    colour: str
    start_date: date
    end_date: date


UnitRead = ProgrammeUnitRead | StandaloneUnitRead
UnitUpdate = ProgrammeUnitUpdate | StandaloneUnitUpdate
UnitCreate = ProgrammeUnitCreate | StandaloneUnitCreate


class UnitAll(BaseModel):
    units: List[UnitRead]


## Maybe port the below to Jack's Coursework Schema
class CourseworkRead(BaseModel):
    id: uuid.UUID
    name: str
    description: str
    due_date: datetime
    creation_date: datetime
    colour: str


class CourseworkAll(BaseModel):
    courseworks: List[CourseworkRead]
