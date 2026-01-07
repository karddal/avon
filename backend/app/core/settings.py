from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    access_token_expiry_minutes: int
    jwt_audience: str
    jwt_issuer: str
    jwks_url: str
    class Config:
        env_file = ".env"

settings = Settings()