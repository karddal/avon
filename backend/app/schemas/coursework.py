from typing import Annotated

import datetime
from pydantic import BaseModel, AfterValidator
from uuid import UUID
import re


def is_valid_name(name: str) -> str:
    if 1 <= len(name) <= 100:
        return name
    else:
        raise ValueError("Name must be between 1 and 100 characters")


def is_valid_description(description: str) -> str:
    if 1 <= len(description) <= 5000:
        return description
    else:
        raise ValueError("Description must be between 1 and 5000 characters")


def is_valid_due_date(date: datetime.datetime) -> datetime.datetime:
    if date.tzinfo is None:
        date = date.replace(tzinfo=datetime.timezone.utc)
        
    now = datetime.datetime.now(datetime.timezone.utc)
    one_year_onwards = now + datetime.timedelta(days=365)

    if date <= now:
        raise ValueError("Due date must be greater than now")
    elif date > one_year_onwards:
        raise ValueError("Due date must be within one year from now")
    else:
        return date

def is_valid_colour(c: str) -> str:
    match = re.search(r'^(?:[0-9a-fA-F]{3}){1,2}$', c)
    if match:
        return c
    else:
        raise ValueError("Invalid colour")

# Type aliases
Name = Annotated[str, AfterValidator(is_valid_name)]
Description = Annotated[str, AfterValidator(is_valid_description)]
DueDate = Annotated[datetime.datetime, AfterValidator(is_valid_due_date)]  # Fixed
Colour = Annotated[str, AfterValidator(is_valid_colour)]

class CourseworkRead(BaseModel):
    id: UUID
    name: str
    description: str
    unit_id: UUID
    due_date: datetime.datetime
    creation_date: datetime.datetime
    colour: str

class CourseworkUpdateFormData(CourseworkRead):
    unit_name: str
    unit_code: str
    gitlabId: str
    max_end_date: datetime.date

class CourseworkCreate(BaseModel):
    name: Name
    description: Description
    unit_id: UUID
    due_date: DueDate
    colour: str

class CoursewotrkTemplateFile(BaseModel):
    id: str
    name: str
    type: str
    path: str
    mode: str

class CourseworkUpdate(BaseModel):
    name: Name | None = None
    description: Description | None = None
    unit_id: UUID | None = None
    due_date: DueDate | None = None
    colour: str | None = None

class CourseworkDelete(BaseModel):
    id: UUID
    deletion_successful: bool

class CourseworkTemplateExists(BaseModel):
    exists: bool

class CourseworkTemplateActivate(BaseModel):
    httpsCloneUrl: str
    sshCloneUrl: str

