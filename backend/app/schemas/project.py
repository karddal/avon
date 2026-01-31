
from datetime import date
import uuid
from pydantic import BaseModel

from app.schemas.programme import Name

class ProjectCreate(BaseModel):
    name: str
    coursework_id: uuid.UUID

class ProjectRead(BaseModel):
    name: str
    coursework_id: uuid.UUID