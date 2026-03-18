
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, HTTPException
from fastapi.params import Depends
from sqlmodel import Session, select
from starlette import status

from app.core.scopes.scopes import FERoles, require_role
from app.db.session import get_session
from app.models.base_image import BaseImage
from app.routers.unit import token_dependency
from app.schemas.base_image import BaseImageCreate, BaseImageList

router = APIRouter(prefix="/base_image", tags=["base_image"])
session_dependency = Annotated[Session, Depends(dependency=get_session)]

@router.get(path="/", response_model=BaseImageList)
async def get_base_images_admin(session: session_dependency, token: token_dependency):
    # this is an admin route, so require admin fe role

    await require_role(FERoles.ADMIN, token=token, session=session)

    images = list(session.exec(select(BaseImage)).all())

    return BaseImageList(images=images)

@router.post(path="/create", response_model=BaseImage, status_code=status.HTTP_201_CREATED)
async def create_base_image(image: BaseImageCreate, session: session_dependency, token: token_dependency):

    await require_role(FERoles.ADMIN, token=token, session=session)

    base_image_already_exists = session.exec(
        select(BaseImage).where((BaseImage.image_uri == image.image_uri) & (BaseImage.name == image.name) & (BaseImage.description == image.description))
    ).first()

    if base_image_already_exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Base image with that data already exists")

    db_base_image = BaseImage(name=image.name, description=image.description, image_uri=image.image_uri)
    session.add(instance=db_base_image)
    session.commit()
    session.refresh(db_base_image)
    return db_base_image

@router.delete(path="/{id}", status_code=status.HTTP_200_OK)
async def delete_base_image(id: str, session: session_dependency, token: token_dependency):

    await require_role(FERoles.ADMIN, token=token, session=session)

    db_image = session.get(BaseImage, ident=UUID(id))

    if not db_image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Base image not found with that ID")

    session.delete(instance=db_image)
    session.commit()

    return {"message": "Base image deleted."}
