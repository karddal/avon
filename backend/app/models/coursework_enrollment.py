from datetime import datetime
from uuid import UUID

from sqlmodel import Field, SQLModel


class CourseworkEnrollment(SQLModel, table=True):
    """
    A student enrolled on a coursework. This will usually be created automatically when a coursework is created. It stores specific information about students,
    such as the individual due dates, due to extensions etc.

    :param student_id: The id of the student

    :param coursework_id: The id of the coursework

    :param individual_due_date: The specific due date of coursework for this student in particular

    :param gl_repo_id: The repo that the student's coursework submission will come from
    """
    student_id: UUID = Field(primary_key=True)
    coursework_id: UUID = Field(primary_key=True)
    individual_due_date: datetime = Field(nullable=False)
    gl_repo_id: str = Field(nullable=False)
