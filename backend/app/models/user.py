import datetime
import uuid

from sqlmodel import SQLModel, Field
from uuid import UUID

class User(SQLModel, table = True):
    id: UUID = Field(primary_key=True, default_factory=uuid.uuid4)
    first_name: str = Field(index = True)
    last_name: str = Field(index = True)
    email: str = Field(index = True)
    password: str = Field()
    creation_date: datetime.datetime = Field(default_factory = datetime.datetime.now)
    is_lecturer: bool = Field(default = False)

# class Lecturer(User, table = True):
#
# class Student(User, table = True):
