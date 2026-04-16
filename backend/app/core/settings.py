import json
from typing import Annotated

from app.core.env import AppEnv, load_backend_env, normalize_app_env
from pydantic import AliasChoices, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode

load_backend_env()

class Settings(BaseSettings):
    app_env: AppEnv = Field(
        default="production",
        validation_alias=AliasChoices("APP_ENV", "ENV"),
    )
    database_url: str | None = Field(default=None, validation_alias="DATABASE_URL")
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=list,
        validation_alias=AliasChoices("CORS_ORIGINS", "CORS_ORIGIN"),
    )
    jwt_audience: str
    jwt_issuer: str
    jwks_url: str
    log_level: str = "INFO"
    ignore_auth: bool = False
<<<<<<< HEAD
    testing_mode: bool = False
    test_fixture_key: str | None = None
    aws_ecs_cluster: str
    aws_results_queue_url: str
    aws_bucket: str
    model_config = SettingsConfigDict(
        env_file=".env"
    )  # Keep on getting warnings in tests to do this, it's the updated version of the code below
    # class Config:           Old code that won't work in Pydantic v3 apparently
    #     env_file = ".env"
    # Please Ensure to test This in the PR, need to make sure it works

=======
    enable_test_fixtures: bool = False
    allow_historical_seed_data: bool = False
    run_background_worker: bool = True
    test_fixture_key: str | None = None
    gitlab_api_token: str | None = None
    gitlab_base_url: str | None = None
    gitlab_root_id: str | None = None
    aws_ecs_cluster: str | None = None
    aws_results_queue_url: str | None = None
    aws_bucket: str | None = None

    @field_validator("app_env", mode="before")
    @classmethod
    def validate_app_env(cls, value: str | None) -> AppEnv:
        return normalize_app_env(value)

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> list[str]:
        if value is None:
            return []
        if isinstance(value, list):
            return [str(origin) for origin in value]
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            if stripped.startswith("["):
                parsed = json.loads(stripped)
                if not isinstance(parsed, list):
                    raise ValueError("CORS_ORIGINS must decode to a list")
                return [str(origin) for origin in parsed]

            return [origin.strip() for origin in stripped.split(",") if origin.strip()]

        raise ValueError("CORS_ORIGINS must be a string or list")

    @model_validator(mode="after")
    def validate_runtime_config(self) -> "Settings":
        if self.testing_mode:
            return self

        if self.app_env == "development" and not self.aws_results_queue_url:
            self.run_background_worker = False
            return self

        if not self.run_background_worker:
            return self

        if not self.aws_results_queue_url:
            raise ValueError(
                "AWS_RESULTS_QUEUE_URL is required when RUN_BACKGROUND_WORKER=true"
            )

        return self

    @property
    def testing_mode(self) -> bool:
        return self.app_env == "test"
>>>>>>> dev

settings = Settings()
