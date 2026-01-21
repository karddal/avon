import uuid
from datetime import date, datetime
from typing import Annotated, List

from pydantic import AfterValidator, BaseModel, ConfigDict, Field

from app.models.colour import Colour


def name_is_correct_length(name: str) -> str:
    if 1 <= len(name) <= 72:
        return name
    else:
        raise ValueError("Name must be between 1 and 72 characters")

Name = Annotated[str, AfterValidator(name_is_correct_length)]

class UnitRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: Name
    description: str
    creation_date: datetime
    unit_code: str
    colour: str
    programme_id: uuid.UUID

class UnitLecturers(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    lecturers: List[str]

class UnitCreate(BaseModel):
    name: Name
    description: str = Field(min_length=1, max_length=2000)
    unit_code: str = Field(min_length=1, max_length=100)
    colour: Colour
    programme_id: uuid.UUID


class UnitUpdate(BaseModel):
    name: Name
    description: str
    unit_code: str
    colour: str
    programme_id: uuid.UUID


class UnitAll(BaseModel):
    units: List[UnitRead]

class UnitWithoutProgramme(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: Name
    description: str
    creation_date: datetime
    unit_code: str
    colour: str

class ProgrammeWithUnits(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    start_date: date
    end_date: date
    units: List[UnitWithoutProgramme]

class UnitAllByGroup(BaseModel):
    programmes: List[ProgrammeWithUnits]


## Maybe port the below to Jack's Coursework Schema
class CourseworkReadWithoutUnit(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    description: str
    due_date: datetime
    creation_date: datetime
    colour: str


class CourseworkAll(BaseModel):
    courseworks: List[CourseworkReadWithoutUnit]
