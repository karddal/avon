from typing import Annotated

from fastapi import Header, HTTPException, status

from app.core.settings import settings


def ensure_test_fixture_key_configured() -> None:
<<<<<<< HEAD
    if settings.enable_test_fixtures and not settings.test_fixture_key:
        raise RuntimeError(
            "TEST_FIXTURE_KEY must be set when ENABLE_TEST_FIXTURES=True"
        )


async def require_test_fixture_access(
    test_fixture_key: Annotated[
        str | None, Header(alias="X-Test-Fixture-Key")
    ] = None,
) -> None:
    if not settings.enable_test_fixtures:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found",
        )

    if settings.test_fixture_key is None:
        raise RuntimeError(
            "TEST_FIXTURE_KEY must be set when ENABLE_TEST_FIXTURES=True"
        )
||||||| parent of b3b4707 (take updated scopes stuff from scopes branch)
=======
    if settings.testing_mode and not settings.test_fixture_key:
        raise RuntimeError("TEST_FIXTURE_KEY must be set when TESTING_MODE=True")


async def require_test_fixture_access(
    test_fixture_key: Annotated[
        str | None, Header(alias="X-Test-Fixture-Key")
    ] = None,
) -> None:
    if not settings.testing_mode:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found",
        )

    if settings.test_fixture_key is None:
        raise RuntimeError("TEST_FIXTURE_KEY must be set when TESTING_MODE=True")
>>>>>>> b3b4707 (take updated scopes stuff from scopes branch)

    if test_fixture_key != settings.test_fixture_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid test fixture key",
        )
