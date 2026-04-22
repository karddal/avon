from types import SimpleNamespace

from app.core.settings import settings
from app.routers.seeding import request_is_local, reset_route_enabled


def _request_with_host(host: str):
    return SimpleNamespace(client=SimpleNamespace(host=host))


def test_request_is_local_accepts_loopback_variants():
    assert request_is_local(_request_with_host("127.0.0.1"))
    assert request_is_local(_request_with_host("::1"))
    assert request_is_local(_request_with_host("localhost"))
    assert request_is_local(_request_with_host("::ffff:127.0.0.1"))


def test_request_is_local_rejects_non_loopback_hosts():
    assert not request_is_local(_request_with_host("192.168.1.10"))
    assert not request_is_local(_request_with_host("example.test"))
    assert not request_is_local(SimpleNamespace(client=None))


def test_reset_route_enabled_when_test_fixtures_enabled(monkeypatch):
    monkeypatch.setenv("ENV", "development")
    monkeypatch.setattr(settings, "enable_test_fixtures", True)

    assert reset_route_enabled()
