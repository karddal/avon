from typing import Annotated, List
from app.core.helpers.scraping import scrape_full_programme
from app.db.session import get_session
from app.schemas.structure import PreviewPayload, StructurePreviewResponse
from fastapi import APIRouter, Depends
from sqlmodel import Session


router = APIRouter(prefix="/structure", tags=["structure"])
session_dependency = Annotated[Session, Depends(get_session)]

@router.post("/preview", response_model=StructurePreviewResponse, status_code=201)
async def preview_structure(payload: PreviewPayload):
    data = await scrape_full_programme(payload)
    print({"results": data})
    return {"results": data}

