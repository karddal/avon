from uuid import UUID

from pydantic import BaseModel

from app.models.base_image import BaseImage


class BaseImageList(BaseModel):
    images: list[BaseImage]


class BaseImageCreate(BaseModel):
    name: str
    description: str
    task_definition: str


class BaseImageMarkActivityRequest(BaseModel):
    new_active_status: bool


class BaseImageMarkActivityResponse(BaseModel):
    base_image_id: UUID
    new_is_active: bool
