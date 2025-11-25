from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    jwt_secret_key: str
    access_token_expiry_minutes: int
    class Config:
        env_file = ".env"

settings = Settings()