
from pydantic import BaseModel, AfterValidator
from datetime import datetime
from typing import Annotated, Optional, List
import uuid

def name_is_correct_length(name: str) -> str:
    if 1<=len(name)<=72:
        return name
    else:
        raise ValueError("Name must be between 1 and 72 characters")

Name = Annotated[str, AfterValidator(name_is_correct_length)]

class UnitRead(BaseModel):
  name: Name
  description: str
  creation_date: datetime

class UnitCreate(BaseModel):
    name: Name
    description: str
    group_ids: Optional[List[uuid.UUID]] = None

class UnitUpdate(BaseModel):
    name: Name
    description: str
    group_ids: Optional[List[uuid.UUID]] = None

class UnitAll(BaseModel):
    units: List[UnitRead]

## Maybe port the below to Jack's Coursework Schema
class CourseworkRead(BaseModel):
    id: uuid.UUID
    name: str
    description: str
    due_date: datetime
    creation_date: datetime

class CourseworkAll(BaseModel):
    courseworks: List[CourseworkRead]