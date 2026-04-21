import argparse
import json
from pathlib import Path
from typing import Callable, Optional, Sequence
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.core.env import BACKEND_DIR, load_backend_env

DEFAULT_SEEDING_URL = "http://localhost:8000/seeding/reset-db"
DEFAULT_SEED_SQL = BACKEND_DIR / "sql" / "seed.sql"


def _load_cli_env() -> None:
    load_backend_env()


_load_cli_env()


def _get_reset_database() -> Callable[..., dict[str, str]]:
    from app.services.db_reset import reset_database

    return reset_database


def _reset_via_backend(url: str) -> dict[str, object]:
    request = Request(
        url,
        method="POST",
    )

    with urlopen(request) as response:
        body = response.read().decode("utf-8")
        return json.loads(body) if body else {"status": "ok"}


def _reset_locally(args: argparse.Namespace) -> dict[str, str]:
    reset_database = _get_reset_database()
    return reset_database(
        seed_sql_path=Path(args.seed_sql).resolve(),
    )


def cmd_seed(args: argparse.Namespace) -> None:
    try:
        result = _reset_via_backend(args.url)
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(body or f"HTTP {exc.code}") from exc
    except URLError:
        result = _reset_locally(args)

    print(json.dumps(result))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="python -m app.cli.manage")
    subparsers = parser.add_subparsers(dest="command", required=True)

    seed_parser = subparsers.add_parser("seed")
    seed_parser.add_argument("--url", default=DEFAULT_SEEDING_URL)
    seed_parser.add_argument("--seed-sql", default=str(DEFAULT_SEED_SQL))
    seed_parser.set_defaults(func=cmd_seed)

    return parser


def main(argv: Optional[Sequence[str]] = None) -> None:
    args = build_parser().parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
