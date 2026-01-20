set shell := ["bash", "-cu"]
set windows-shell := ["powershell.exe", "-NoProfile", "-Command"]

default:
    just --list

check-fe:
    @echo "Formatting and linting frontend..."
    cd frontend && npx biome check

check-be:
    @echo "Formatting and linting backend..."
    cd backend && uv run ruff check

check: check-fe check-be

fix-fe:
    @echo "Fixing frontend..."
    cd frontend && npx biome check --fix

fix-be:
    @echo "Fixing backend..."
    cd backend && uv run ruff check --fix

fixit: fix-fe fix-be

test-be:
	@echo "Testing backend routers..."
	cd backend && uv run pytest -v

run-fe:
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
    cd frontend && npm i
    cd backend && uv sync

serve-book:
    cd documentation && mdbook serve --open