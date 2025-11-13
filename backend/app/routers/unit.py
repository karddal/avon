

from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db.session import get_session
from typing import Annotated


# from app.models.user import User
# from app.schemas.user import UserCreate

router = APIRouter(prefix = "/unit")
session_dependency = Annotated[Session, Depends(get_session)]

# # Get all the units
# @router.get("/", response_model=)
# async def get_units(session: session_dependency, response_model:):
#     db_user = User.model_validate(user)
#     session.add(db_user)
#     session.commit()
#     session.refresh(db_user)
#     return db_user

# # Get all the courseworks for a specific unit
# @router.post("")

# # @router.delete('/delete')
# # async def delete_user(id: UUID, session: session_dependency):

# @router.get("/check")
# async def get_data(session: session_dependency):
#     statement = select(User)
#     users = session.exec(statement).all()



#     return {"users": [user.model_dump() for user in users]}