set shell := ["bash", "-cu"]
set windows-shell := ["powershell.exe", "-NoProfile", "-Command"]

default:
    just --list

check-fe:
    @echo "Formatting and linting frontend..."
    just _check-fe-{{os()}}

_check-fe-windows:
    cd frontend; npx biome check

_check-fe-linux:
    cd frontend && npx biome check

_check-fe-macos:
    cd frontend && npx biome check

check-be:
    @echo "Formatting and linting backend..."
    just _check-be-{{os()}}

_check-be-windows:
    cd backend; uv run ruff check

_check-be-linux:
    cd backend && uv run ruff check

_check-be-macos:
    cd backend && uv run ruff check

check: check-fe check-be

fix-fe:
    @echo "Fixing frontend..."
    just _fix-fe-{{os()}}

_fix-fe-windows:
    cd frontend; npx biome check --fix

_fix-fe-linux:
    cd frontend && npx biome check --fix

_fix-fe-macos:
    cd frontend && npx biome check --fix

fix-be:
    @echo "Fixing backend..."
    just _fix-be-{{os()}}

_fix-be-windows:
    cd backend; uv run ruff check --fix

_fix-be-linux:
    cd backend && uv run ruff check --fix

_fix-be-macos:
    cd backend && uv run ruff check --fix

fixit: fix-fe fix-be

test-be:
	@echo "Testing backend routers..."
	just _test-be-{{os()}}


_test-be-windows:
    cd backend; uv run pytest -v

_test-be-linux:
    cd backend && uv run pytest -v

_test-be-macos:
    cd backend && uv run pytest -v

run-fe:
    just _run-fe-{{os()}}

_run-fe-windows:
    cd frontend; npm run dev

_run-fe-linux:
    cd frontend && npm run dev

_run-fe-macos:
    cd frontend && npm run dev

run-be:
    just _run-be-{{os()}}

_run-be-windows:
    cd backend; $env:ENV="dev"; uv run fastapi dev

_run-be-linux:
    cd backend && ENV=dev uv run fastapi dev

_run-be-macos:
    cd backend && ENV=dev uv run fastapi dev

sync:
    just _sync-{{os()}}

_sync-windows:
    cd frontend; npm i
    cd backend; uv sync

_sync-linux:
    cd frontend && npm i
    cd backend && uv sync

_sync-macos:
    cd frontend && npm i
    cd backend && uv sync

serve-book:
    just _serve-book-{{os()}}

_serve-book-windows:
    cd documentation; mdbook serve --open

_serve-book-linux:
    cd documentation && mdbook serve --open

_serve-book-macos:
    cd documentation && mdbook serve --open