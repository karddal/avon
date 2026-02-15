from datetime import date
import random
from typing import Annotated
from app.core.helpers.scraping import scrape_full_programme
from app.db.session import get_session
from app.routers.programme import create_programme
from app.routers.unit import create_unit
from app.schemas.structure import PreviewPayload, StructurePreviewResponse
from app.schemas.unit import UnitCreate
from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.schemas.programme import ProgrammeCreate


router = APIRouter(prefix="/structure", tags=["structure"])
session_dependency = Annotated[Session, Depends(get_session)]

@router.post("/preview", response_model=StructurePreviewResponse, status_code=201)
async def preview_structure(payload: PreviewPayload):
    data = await scrape_full_programme(payload)
    print({"results": data})
    return {"results": data}

@router.post("/create", status_code=201)
async def create_structure(payload: StructurePreviewResponse, session: session_dependency):
    for programme in payload.results:
        prog = await create_programme(
            ProgrammeCreate(
                name=programme.programme_name,
                start_date=date(programme.start_year, 1, 1),
                end_date=date(programme.end_year, 1, 1),
            ), session=session
        )

        for unit in programme.units:
            await create_unit(UnitCreate(
                programme_id=prog.id,
                name=unit.name,
                unit_code=unit.code,
                colour=f"{random.randint(0, 0xFFFFFF):06x}",
                description="temp"
                ), 
                session=session
            )

    return {"message": "Structure created successfully"}
