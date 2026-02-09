
import uuid
from pydantic import BaseModel

class TemplateCreate(BaseModel):
    coursework_id: uuid.UUID

class ProjectCreate(BaseModel):
    name: str
    coursework_id: uuid.UUID

class ProjectRead(BaseModel):
    name: str
    coursework_id: uuid.UUID

class ProjectDelete(BaseModel):
    group_id: int