from datetime import datetime
from uuid import UUID

from sqlmodel import Field, SQLModel


class RefreshToken(SQLModel, table = True):
    token: str = Field(primary_key=True)
    user_id: UUID = Field(foreign_key="unit.id")
    expires_at: datetime = Field()
    created_at: datetime = Field()
    # revoked: bool = Field()