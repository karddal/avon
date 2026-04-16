from typing import Annotated

from fastapi import Header, HTTPException, status

from app.core.settings import settings


def ensure_test_fixture_key_configured() -> None:
<<<<<<< HEAD
    if settings.testing_mode and not settings.test_fixture_key:
        raise RuntimeError("TEST_FIXTURE_KEY must be set when TESTING_MODE=True")
=======
    if settings.enable_test_fixtures and not settings.test_fixture_key:
        raise RuntimeError(
            "TEST_FIXTURE_KEY must be set when ENABLE_TEST_FIXTURES=True"
        )
>>>>>>> dev


async def require_test_fixture_access(
    test_fixture_key: Annotated[
        str | None, Header(alias="X-Test-Fixture-Key")
    ] = None,
) -> None:
<<<<<<< HEAD
    if not settings.testing_mode:
=======
    if not settings.enable_test_fixtures:
>>>>>>> dev
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found",
        )

    if settings.test_fixture_key is None:
<<<<<<< HEAD
        raise RuntimeError("TEST_FIXTURE_KEY must be set when TESTING_MODE=True")
=======
        raise RuntimeError(
            "TEST_FIXTURE_KEY must be set when ENABLE_TEST_FIXTURES=True"
        )
>>>>>>> dev

    if test_fixture_key != settings.test_fixture_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid test fixture key",
        )
