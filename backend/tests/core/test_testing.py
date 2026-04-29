import pytest
from fastapi import HTTPException

from app.core import testing


def test_ensure_test_fixture_key_configured_allows_configured_key(monkeypatch):
    monkeypatch.setattr(testing.settings, "enable_test_fixtures", True)
    monkeypatch.setattr(testing.settings, "test_fixture_key", "configured")

    testing.ensure_test_fixture_key_configured()


def test_ensure_test_fixture_key_configured_rejects_missing_key(monkeypatch):
    monkeypatch.setattr(testing.settings, "enable_test_fixtures", True)
    monkeypatch.setattr(testing.settings, "test_fixture_key", None)

    with pytest.raises(RuntimeError):
        testing.ensure_test_fixture_key_configured()


@pytest.mark.asyncio
async def test_require_test_fixture_access_accepts_matching_key(monkeypatch):
    monkeypatch.setattr(testing.settings, "enable_test_fixtures", True)
    monkeypatch.setattr(testing.settings, "test_fixture_key", "configured")

    await testing.require_test_fixture_access("configured")


@pytest.mark.asyncio
async def test_require_test_fixture_access_hides_disabled_fixtures(monkeypatch):
    monkeypatch.setattr(testing.settings, "enable_test_fixtures", False)

    with pytest.raises(HTTPException) as exc:
        await testing.require_test_fixture_access("configured")

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_require_test_fixture_access_rejects_wrong_key(monkeypatch):
    monkeypatch.setattr(testing.settings, "enable_test_fixtures", True)
    monkeypatch.setattr(testing.settings, "test_fixture_key", "configured")

    with pytest.raises(HTTPException) as exc:
        await testing.require_test_fixture_access("wrong")

    assert exc.value.status_code == 403
