from typing import Annotated

import uuid
import datetime
from pydantic import BaseModel, AfterValidator
from uuid import UUID


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
    now = datetime.datetime.now()
    one_year_onwards = now + datetime.timedelta(days=365)

    if date <= now:
        raise ValueError("Due date must be greater than today")
    elif date > one_year_onwards:
        raise ValueError("Due date must be within one year from now")
    else:
        return date


# Type aliases
Name = Annotated[str, AfterValidator(is_valid_name)]
Description = Annotated[str, AfterValidator(is_valid_description)]
DueDate = Annotated[datetime.datetime, AfterValidator(is_valid_due_date)]  # Fixed

class CourseworkRead(BaseModel):
    id: UUID
    name: str
    description: str
    unit_id: UUID
    due_date: DueDate #already validated as from our api
    creation_date: datetime.datetime

class CourseworkCreate(BaseModel):
    name: Name
    description: Description
    unit_id: UUID
    due_date: DueDate


class CourseworkUpdate(BaseModel):
    id: UUID
    name: Name | None = None
    description: Description | None = None
    unit_id: UUID | None = None
    due_date: DueDate | None = None

