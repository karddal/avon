from typing import List
from pydantic import BaseModel

class UnitPreview(BaseModel):
    name: str
    code: str
    credits: int
    teaching_block: str
    status: str
    link: str

class ProgrammePreview(BaseModel):
    programme_name: str
    units: List[UnitPreview]

class StructurePreviewResponse(BaseModel):
    results: List[ProgrammePreview]

class PreviewPayload(BaseModel):
  link: str
  years: List[int]