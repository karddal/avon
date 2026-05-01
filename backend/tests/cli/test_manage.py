import argparse
import io
from urllib.error import HTTPError, URLError

import pytest

from app.cli import manage
from app.core.terminal import format_message


def _http_error(url: str, code: int, body: str = '{"detail":"Not Found"}') -> HTTPError:
    return HTTPError(
        url=url,
        code=code,
        msg="request failed",
        hdrs=None,
        fp=io.BytesIO(body.encode("utf-8")),
    )


def test_cmd_seed_uses_backend_when_available(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    args = argparse.Namespace(
        url=manage.DEFAULT_SEEDING_URL,
        seed_sql=str(manage.DEFAULT_SEED_SQL),
    )
    expected = {"status": "ok", "message": "Database reset and seeded"}

    monkeypatch.setattr(
        manage,
        "_reset_via_backend",
        lambda _: {"status": "ok", "message": "Database reset and seeded"},
    )
    monkeypatch.setattr(
        manage,
        "_reset_locally",
        lambda _: pytest.fail("seed should not fall back when backend is available"),
    )

    manage.cmd_seed(args)

    assert capsys.readouterr().out.rstrip("\n") == (
        format_message("seed", expected["message"])
    )


def test_cmd_seed_falls_back_to_local_when_backend_is_unavailable(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    args = argparse.Namespace(
        url=manage.DEFAULT_SEEDING_URL,
        seed_sql=str(manage.DEFAULT_SEED_SQL),
    )
    expected = {"status": "ok", "message": "Database reset and seeded"}

    def fail_remote(_: str) -> dict[str, object]:
        raise URLError("connection refused")

    monkeypatch.setattr(manage, "_reset_via_backend", fail_remote)
    monkeypatch.setattr(
        manage,
        "_reset_locally",
        lambda _: {"status": "ok", "message": "Database reset and seeded"},
    )

    manage.cmd_seed(args)

    assert capsys.readouterr().out.rstrip("\n") == (
        format_message("seed", expected["message"])
    )


def test_cmd_seed_keeps_custom_url_http_errors(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    custom_url = "http://localhost:9999/seeding/reset-db"
    args = argparse.Namespace(
        url=custom_url,
        seed_sql=str(manage.DEFAULT_SEED_SQL),
    )

    def fail_remote(_: str) -> dict[str, object]:
        raise _http_error(custom_url, 404)

    monkeypatch.setattr(manage, "_reset_via_backend", fail_remote)
    monkeypatch.setattr(
        manage,
        "_reset_locally",
        lambda _: pytest.fail("custom URL errors should not fall back locally"),
    )

    with pytest.raises(RuntimeError, match="Not Found"):
        manage.cmd_seed(args)


def test_seeding_alias_is_not_supported() -> None:
    with pytest.raises(SystemExit):
        manage.build_parser().parse_args(["seeding"])
