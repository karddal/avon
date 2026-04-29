from datetime import date
import random
from typing import Annotated
from app.core.helpers.scraping import scrape_full_programme
from app.core.scopes.scopes import FERoles, authenticate_user, require_role
from app.core.security import get_bearer
from app.db.session import get_session
from app.routers.programme import create_programme
from app.routers.unit import create_unit
from app.schemas.structure import PreviewPayload, StructureCreateResponse, StructurePreviewResponse
from app.schemas.unit import UnitCreateOwner
from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlmodel import Session
from app.schemas.programme import ProgrammeCreate


router = APIRouter(prefix="/structure", tags=["structure"])
session_dependency = Annotated[Session, Depends(get_session)]
token_dependency = Annotated[HTTPAuthorizationCredentials, Depends(get_bearer)]

@router.post("/preview", response_model=StructurePreviewResponse, status_code=201)
async def preview_structure(payload: PreviewPayload, session: session_dependency, token: token_dependency):
    await require_role(FERoles.ADMIN, token=token, session=session)
    data = await scrape_full_programme(payload)
    return StructurePreviewResponse(results=data)

@router.post("/create", status_code=201, response_model=StructureCreateResponse)
async def create_structure(payload: StructurePreviewResponse, session: session_dependency, token: token_dependency):
    await require_role(FERoles.ADMIN, token=token, session=session)
    current_user = await authenticate_user(resource=None, token=token, session=session)
    for programme in payload.results:
        prog = await create_programme(
            ProgrammeCreate(
                name=programme.programme_name,
                start_date=date(programme.start_year, 9, 1),
                end_date=date(programme.end_year, 8, 31),
            ), session=session, token=token
        )

        for unit in programme.units:
            await create_unit(UnitCreateOwner(
                programme_id=prog.id,
                name=unit.name,
                unit_code=unit.code,
                colour=f"{random.randint(0, 0xFFFFFF):06x}",
                description="temp",
                owner=current_user.user_id,
                ), 
                session=session,
                token=token
            )

    return StructureCreateResponse(message="Structure created successfully")
