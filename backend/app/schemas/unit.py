import uuid
from datetime import date, datetime
from typing import Annotated, List

from pydantic import AfterValidator, BaseModel, ConfigDict

def name_is_correct_length(name: str) -> str:
    if 1 <= len(name) <= 72:
        return name
    else:
        raise ValueError("Name must be between 1 and 72 characters")

def description_is_correct_length(description: str) -> str:
    if 1 <= len(description) <= 2000:
        return description
    else:
        raise ValueError("Description must be between 1 and 2000 characters")

def valid_unit_code(unit_code: str) -> str:
    if 1 <= len(unit_code) <= 100:
        return unit_code
    else:
        raise ValueError("Unit code must be between 1 and 100 characters")

def valid_colour(colour: str) -> str:
    if (len(colour) == 6):
        return colour
    else:
        raise ValueError("Colour code is invalid length")

Name = Annotated[str, AfterValidator(name_is_correct_length)]
Description = Annotated[str, AfterValidator(description_is_correct_length)]
UnitCode = Annotated[str, AfterValidator(valid_unit_code)]
Colour = Annotated[str, AfterValidator(valid_colour)]
class UnitRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: Name
    description: str
    creation_date: datetime
    unit_code: str
    colour: Colour
    programme_id: uuid.UUID
    unlocked: bool

class UnitReadWithDates(UnitRead):
    start_date: datetime
    end_date: datetime

class UnitLecturers(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    lecturers: List[str]

class UnitStudents(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    students: List[str]

class UnitUsers(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    users: List[str]

class UnitCreate(BaseModel):
    name: Name
    description: Description
    unit_code: UnitCode
    colour: Colour
    programme_id: uuid.UUID
    unlocked: bool | None = None

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
    unlocked: bool

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

class UnitEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: Name
    unit_code: str
    programme_start_date: str
    programme_end_date: str