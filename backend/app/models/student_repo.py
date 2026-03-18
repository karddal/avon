

from uuid import UUID

from sqlmodel import Field, Relationship, SQLModel

from app.models.coursework import Coursework


class StudentRepo(SQLModel, table=True):
    student_id: str = Field(primary_key=True)
    repo_url: str
    cw_id: UUID = Field(primary_key=True, foreign_key="coursework.id")
    coursework: Coursework = Relationship(back_populates="student_repos")
