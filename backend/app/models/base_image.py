
import uuid
from uuid import UUID

from sqlmodel import Field, SQLModel


class BaseImage(SQLModel, table=True):
    id: UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    name: str = Field(nullable=False)
    description: str = Field(nullable=False)
    image_uri: str = Field(nullable=False)
