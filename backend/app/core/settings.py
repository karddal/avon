from app.core.env import load_backend_env
from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings

load_backend_env()

class Settings(BaseSettings):
    jwt_audience: str
    jwt_issuer: str
    jwks_url: str
    ignore_auth: bool = False
    enable_test_fixtures: bool = Field(
        default=False,
        validation_alias=AliasChoices("ENABLE_TEST_FIXTURES", "TESTING_MODE"),
    )
    allow_historical_seed_data: bool = Field(
        default=False,
        validation_alias=AliasChoices("ALLOW_HISTORICAL_SEED_DATA", "TESTING_MODE"),
    )
    test_fixture_key: str | None = None
    aws_ecs_cluster: str | None = None
    aws_results_queue_url: str | None = None
    aws_bucket: str | None = None

    @model_validator(mode="after")
    def validate_runtime_config(self) -> "Settings":
        if self.testing_mode:
            return self

        missing = [
            name
            for name in ("aws_ecs_cluster", "aws_results_queue_url", "aws_bucket")
            if not getattr(self, name)
        ]
        if missing:
            missing_str = ", ".join(missing)
            raise ValueError(
                f"Missing required AWS configuration outside testing mode: {missing_str}"
            )

        return self

    @property
    def testing_mode(self) -> bool:
        return self.enable_test_fixtures

settings = Settings()
