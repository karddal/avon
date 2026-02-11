
import uuid
from pydantic import BaseModel

class TemplateCreate(BaseModel):
    coursework_id: uuid.UUID

class ProjectCreate(BaseModel):
    name: str
    coursework_id: uuid.UUID
    template_group_id: int
    template_id: int

class ProjectFork(BaseModel):
    name: str
    coursework_id: uuid.UUID
    template_id: str    

class ProjectRead(BaseModel):
    id: int
    name: str 
    path: str
    web_url: str

class ProjectDelete(BaseModel):
    group_id: int

class ProjectsInCoursework(BaseModel):
    projects: list[ProjectRead]