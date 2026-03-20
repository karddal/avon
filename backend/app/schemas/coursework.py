import datetime
import os
import re
from typing import Annotated, Literal
from uuid import UUID
import datetime
import re

from app.core.settings import settings

from app.models.student_repo import StudentRepo


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
    if settings.allow_historical_seed_data:
        return date

    if date.tzinfo is None:
        now = datetime.datetime.now()
else:
        now = datetime.datetime.now(datetime.timezone.utc)
        date = date.astimezone(datetime.timezone.utc)
    one_year_onwards = now + datetime.timedelta(days=365)

    if date <= now:
        raise ValueError("Due date must be greater than now")
    elif date > one_year_onwards:
        raise ValueError("Due date must be within one year from now")
    else:
        return date


def is_valid_colour(c: str) -> str:
    match = re.search(r"^(?:[0-9a-fA-F]{3}){1,2}$", c)
    if match:
        return c
    else:
        raise ValueError("Invalid colour")


# Type aliases
Name = Annotated[str, AfterValidator(is_valid_name)]
Description = Annotated[str, AfterValidator(is_valid_description)]
DueDate = Annotated[datetime.datetime, AfterValidator(is_valid_due_date)]  # Fixed
Colour = Annotated[str, AfterValidator(is_valid_colour)]

class CourseworkStudentRepos(BaseModel):
    repos: list[StudentRepo]

class StudentWithMaybeRepo(BaseModel):
    id: str
    repo_url: str | None

class CourseworkStudentWithRepos(BaseModel):
    students: list[StudentWithMaybeRepo]

class CourseworkUnitIdRead(BaseModel):
    unit_id: UUID

class CourseworkRepoCommit(BaseModel):
    id: str
    short_id: str
    title: str
    author_name: str | None
    authored_date: datetime.datetime | None
    web_url: str | None
    additions: int
    deletions: int

class CourseworkStudentRepoRead(BaseModel):
    repo_url: str
    commits: list[CourseworkRepoCommit]
    total_commits: int

class CourseworkEngineData(BaseModel):
    cw_id: UUID
    base_image_id: UUID | None
    tester_command: str | None

class CourseworkUpdateEngineData(BaseModel):
    base_image_id: UUID
    tester_command: str


class CourseworkRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
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
    templateId: int | None


class CourseworkCreate(BaseModel):
    name: Name
    description: Description
    unit_id: UUID
    due_date: DueDate
    colour: Colour

class CourseworkTemplateFile(BaseModel):
    id: str
    name: str
    type: Literal["blob", "tree"]
    path: str
    mode: str

class CourseworkUpdate(BaseModel):
    name: Name | None = None
    description: Description | None = None
    unit_id: UUID | None = None
    due_date: DueDate | None = None
    colour: Colour | None = None



class CourseworkDelete(BaseModel):
    id: UUID
    deletion_successful: bool


class CourseworkStudent(BaseModel):
    id: str
    individual_due_date: datetime.datetime
    gl_repo_id: str


class CourseworkStudents(BaseModel):
    id: UUID
    students: list[CourseworkStudent]

class CourseworkTemplateExists(BaseModel):
    exists: bool
    templateProjectId: int | None = None

class CourseworkTemplateActivate(BaseModel):
    templateGitLabId: int

class CourseworkTemplateUrl(BaseModel):
    http: str
    ssh: str

class CourseworkTemplateUploadZip(BaseModel):
    templateId: int

class CourseworkSetupProgress(BaseModel):
    title: str
    completed: bool

class CourseworkEventRead(BaseModel):
    id: UUID
    name: Name
    due_date: datetime.datetime
    unit_id: UUID
    unit_name: Name
    colour: Colour | None = None
