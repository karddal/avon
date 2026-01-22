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

force-fix-fe:
    @echo "Fixing frontend..."
    cd frontend && npx biome check --write --unsafe

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
    cd backend && ENV=dev uv run fastapi dev

sync:
    cd frontend && npm i
    cd backend && uv sync

serve-book:
    cd documentation && mdbook serve --open