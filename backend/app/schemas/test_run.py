from pydantic import BaseModel


class StartTestRun(BaseModel):
    repo_ids: list[str]
    notifications_enabled: bool