
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

test-be: test-be-model test-be-schema test-be-router test-be-security

test-be-model:
    @echo "Testing backend models..."
    cd backend && uv run --active pytest -v tests/model

test-be-schema:
    @echo "Testing backend schemas..."
    cd backend && uv run --active pytest -v tests/schemas

test-be-router:
	@echo "Testing backend routers..."
	cd backend && \
	DATABASE_URL=sqlite:///:memory: \
	JWT_SECRET_KEY=abhdvgdgv \
	ACCESS_TOKEN_EXPIRY_MINUTES=60 \
	CORS_ORIGIN=http://testserver \
	uv run --active pytest -v tests/router

test-be-security:
    @echo "Testing backend security..."
    cd backend && uv run --active pytest -v tests/security
run-fe:
    cd frontend && bun run dev

run-be:
    cd backend && uv run fastapi dev
