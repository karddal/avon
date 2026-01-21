from typing import Annotated

import datetime
import uuid
from pydantic import BaseModel, AfterValidator
from uuid import UUID



def is_valid_name(name: str) -> str:
    if 1 <= len(name) <= 100:
        return name
    else:
        raise ValueError("Name must be between 1 and 100 characters")



def is_valid_due_date(date: datetime.datetime) -> datetime.datetime:
    if date.tzinfo is None:
        date = date.replace(tzinfo=datetime.timezone.utc)
        
    now = datetime.datetime.now(datetime.timezone.utc)

    if date <= now:
        raise ValueError("Due date must be greater than now")
    else:
        return date

# Type aliases
Name = Annotated[str, AfterValidator(is_valid_name)]
StartDate = Annotated[datetime.datetime, AfterValidator(is_valid_due_date)]  # Fixed

class ProgrammeCreate(BaseModel):
    name: Name
    start_date: datetime.datetime

class ProgrammeRead(BaseModel):
    id: UUID
    name: Name
    start_date: StartDate
    end_date: datetime.datetime


