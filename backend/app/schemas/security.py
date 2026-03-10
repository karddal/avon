from pydantic import BaseModel

class CurrentUser(BaseModel):
    user_id: str
    role: str | None = None

    @property
    def is_admin(self) -> bool:
        return self.role == 'admin'