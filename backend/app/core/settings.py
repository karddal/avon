from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    jwt_secret_key: str
    access_token_expiry_minutes: int
    model_config = SettingsConfigDict(env_file=".env") # Keep on getting warnings in tests to do this, it's the updated version of the code below
    # class Config:           Old code that won't work in Pydantic v3 apparently
    #     env_file = ".env"
    # Please Ensure to test This in the PR, need to make sure it works
settings = Settings()