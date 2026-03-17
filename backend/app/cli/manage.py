import argparse
import json
import os
from pathlib import Path
from typing import Optional, Sequence
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[2]
DEFAULT_ENV_FILE = BACKEND_DIR / ".env"
DEV_ENV_FILE = BACKEND_DIR / ".env.dev"
DEFAULT_SEEDING_URL = "http://localhost:8000/seeding/reset-db"


def _load_cli_env() -> None:
    if os.getenv("ENV") == "dev":
        load_dotenv(DEV_ENV_FILE, override=False)
        return

    load_dotenv(DEFAULT_ENV_FILE, override=False)
    load_dotenv(DEV_ENV_FILE, override=False)


_load_cli_env()

from app.services.db_reset import DEFAULT_SEED_SQL, reset_database


def cmd_seed(args: argparse.Namespace) -> None:
    reset_database(
        seed_sql_path=Path(args.seed_sql).resolve(),
    )
    print("Seed successful")


def _reset_via_backend(url: str) -> dict[str, object]:
    request = Request(
        url,
        method="POST",
    )

    with urlopen(request) as response:
        body = response.read().decode("utf-8")
        return json.loads(body) if body else {"status": "ok"}


def _reset_locally(args: argparse.Namespace) -> dict[str, str]:
    return reset_database(
        seed_sql_path=Path(args.seed_sql).resolve(),
    )


def cmd_seeding(args: argparse.Namespace) -> None:
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
    seed_parser.add_argument("--seed-sql", default=str(DEFAULT_SEED_SQL))
    seed_parser.set_defaults(func=cmd_seed)

    seeding_parser = subparsers.add_parser("seeding")
    seeding_parser.add_argument("--url", default=DEFAULT_SEEDING_URL)
    seeding_parser.add_argument("--seed-sql", default=str(DEFAULT_SEED_SQL))
    seeding_parser.set_defaults(func=cmd_seeding)

    return parser


def main(argv: Optional[Sequence[str]] = None) -> None:
    args = build_parser().parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
