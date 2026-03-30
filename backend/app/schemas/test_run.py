from pydantic import BaseModel


class StartTestRun(BaseModel):
    repo_urls: list[str]
    notifications_enabled: bool