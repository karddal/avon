from pydantic import BaseModel

class IsLecture(BaseModel):
    is_lecturer: bool