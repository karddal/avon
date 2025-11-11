import datetime
import uuid

from sqlmodel import SQLModel, Field


class Unit(SQLModel, table=True):
    id: uuid.UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    name: str = Field(index = True)
    description: str = Field(index = True)
    creation_date: datetime.datetime = Field(default_factory=datetime.datetime.now)
