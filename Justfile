
default:
    just --list

check-fe:
    @echo "Formatting and linting frontend..."
    cd frontend && bunx biome check

check-be:
    @echo "Formatting and linting backend..."
    cd backend && uv run ruff check

check: check-fe check-be

fix-fe:
    @echo "Fixing frontend..."
    cd frontend && bunx biome check --fix

fix-be:
    @echo "Fixing backend..."
    cd backend && uv run ruff check --fix

fixit: fix-fe fix-be

test-be:
    @echo "Testing backend..."
    cd backend && ./gradlew test

test: test-be

run-fe:
    cd frontend && bun run dev

run-be:
    cd backend && uv run fastapi dev

