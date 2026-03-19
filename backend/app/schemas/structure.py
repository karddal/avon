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
    start_year: int
    end_year: int
    units: List[UnitPreview]

class StructurePreviewResponse(BaseModel):
    results: List[ProgrammePreview]

class StructureCreateResponse(BaseModel):
    message: str

class PreviewPayload(BaseModel):
  link: str
  years: List[int]