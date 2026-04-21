import uuid
from typing import Literal
from typing import Any

from pydantic import BaseModel
from pydantic import field_validator


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


class CreateProjectForkForSpecificStudent(ProjectFork):
    student_ids: list[str]


class ProjectSkeleton(BaseModel):
    group_id: int
    coursework_name: str


class ProjectRead(BaseModel):
    id: int
    name: str
    path: str
    web_url: str


class ProjectDelete(BaseModel):
    group_id: int


class ProjectsInCoursework(BaseModel):
    projects: list[ProjectRead]


class ProjectInviteCreate(BaseModel):
    user_emails: list[str]
    access_level: int = 30
    expires_at: str | None = None


class ProjectInviteStatusTarget(BaseModel):
    project_id: str
    user_email: str

    @field_validator("user_email")
    @classmethod
    def normalize_user_email(cls, value: str) -> str:
        return value.strip().lower()


class ProjectInviteStatusBatchCreate(BaseModel):
    targets: list[ProjectInviteStatusTarget]


class ProjectInviteDelete(BaseModel):
    user_email: str


class ProjectInviteList(BaseModel):
    email: str | None = None


class ProjectInviteResult(BaseModel):
    success: bool
    error: str | list[str] | None = None


class ProjectInviteStatusResult(BaseModel):
    project_id: str
    user_email: str
    status: Literal["accepted", "invited", "not_invited"]


class ProjectInviteStatusBatchResponse(BaseModel):
    success: bool
    data: list[ProjectInviteStatusResult]


class ProjectInviteListResponse(BaseModel):
    success: bool
    data: list[dict[str, Any]] | dict[str, Any]
    error: str | list[str] | None = None
