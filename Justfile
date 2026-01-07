
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
	cd backend && \
	DATABASE_URL=sqlite:///:memory: \
	JWT_SECRET_KEY=abhdvgdgv \
	ACCESS_TOKEN_EXPIRY_MINUTES=60 \
	CORS_ORIGIN=http://testserver \
	uv run --active pytest -v 

run-fe:
    cd frontend && npm run dev

run-be:
    cd backend && uv run fastapi dev
