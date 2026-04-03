from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    jwt_audience: str
    jwt_issuer: str
    jwks_url: str
    ignore_auth: bool = False
<<<<<<< HEAD
    enable_test_fixtures: bool = Field(
        default=False,
        validation_alias=AliasChoices("ENABLE_TEST_FIXTURES", "TESTING_MODE"),
    )
    allow_historical_seed_data: bool = Field(
        default=False,
        validation_alias=AliasChoices("ALLOW_HISTORICAL_SEED_DATA", "TESTING_MODE"),
    )
||||||| parent of b3b4707 (take updated scopes stuff from scopes branch)
    testing_mode: bool = False
    model_config = SettingsConfigDict(env_file=".env") # Keep on getting warnings in tests to do this, it's the updated version of the code below
=======
    testing_mode: bool = False
>>>>>>> b3b4707 (take updated scopes stuff from scopes branch)
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

<<<<<<< HEAD
    @property
    def testing_mode(self) -> bool:
        return self.enable_test_fixtures

||||||| parent of b3b4707 (take updated scopes stuff from scopes branch)
settings = Settings()
=======
>>>>>>> b3b4707 (take updated scopes stuff from scopes branch)

settings = Settings()
