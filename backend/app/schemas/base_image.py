from pydantic import BaseModel

from app.models.base_image import BaseImage


class BaseImageList(BaseModel):
    images: list[BaseImage]


class BaseImageCreate(BaseModel):
    name: str
    description: str
    task_description_name: str
