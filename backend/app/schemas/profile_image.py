from pydantic import BaseModel


class ProfileImageUploadResponse(BaseModel):
    key: str
