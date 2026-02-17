set shell := ["bash", "-cu"]
set windows-shell := ["powershell.exe", "-NoProfile", "-Command"]

# helper
@fe cmd *args:
    just -f Justfile -d frontend {{cmd}}-fe {{args}}

@be cmd *args:
    just -f Justfile -d backend {{cmd}}-be {{args}}

@doc cmd *args:
    just -f Justfile -d documentation {{cmd}}-doc {{args}}

@db cmd *args:
    just -f Justfile {{cmd}}-db {{args}}

# real command
default:
    just --list

check-fe:
    @echo "Formatting and linting frontend..."
    npx biome check

check-be:
    @echo "Formatting and linting backend..."
    uv run ruff check

check:
    just fe check
    just be check

fix-fe:
    @echo "Fixing frontend..."
    npx biome check --fix

fix-be:
    @echo "Fixing backend..."
    uv run ruff check --fix

fixit:
    just fe fix
    just be fix

build-fe:
    npm run build

test-be:
	@echo "Testing backend routers..."
	uv run pytest -v

run-fe env = "dev":
    npm run {{env}}

[unix]
test-fe:
    @echo "Testing frontend..."
    npm test

[windows]
test-fe:
    @echo "Testing frontend..."
    $env:CI_MODE="True"; $env:TESTING_MODE="True"; $env:NEXT_PUBLIC_API_URL="http://localhost:8000"; $env:NEXT_PUBLIC_CDN_PATH=""; $env:BETTER_AUTH_SECRET="wwZgZ19qBU3L0Rxf4oVzAbpw7xkmDOLG"; $env:BETTER_AUTH_URL="https://localhost:3000"; $env:IGNORE_AUTH="False"; $env:GITLAB_API_TOKEN="$env:GITLAB_API_TOKEN"; $env:GITLAB_BASE_URL="https://gitlab.com/api/v4"; $env:GITLAB_ROOT_ID="124674879"; $env:DATABASE_URL="sqlite:///../sqlite.db"; $env:CORS_ORIGIN='["http://localhost:3000"]'; $env:JWKS_URL="http://localhost:3000/api/auth/jwks"; $env:JWT_AUDIENCE="https://localhost:3000"; $env:JWT_ISSUER="https://localhost:3000"; $env:ENV="development"; npm run test-wi


test: 
    just fe test
    just be test

[windows]
run-be env = "dev":
    $env:ENV="{{env}}"; uv run fastapi dev

[unix]
run-be env = "dev":
    ENV={{env}} uv run fastapi dev

sync-fe:
    npm i

sync-be:
    uv sync

sync:
    just fe sync
    just be sync

[unix]
seed-db:
    just fe run db:seed

[windows]
seed-db:
    $env:IGNORE_AUTH="False"; $env:TESTING_MODE="True"; $env:GITLAB_API_TOKEN="$env:GITLAB_API_TOKEN"; $env:GITLAB_BASE_URL="https://gitlab.com/api/v4"; $env:GITLAB_ROOT_ID="124674879"; $env:DATABASE_URL="sqlite:///../sqlite.db"; $env:CORS_ORIGIN='["http://localhost:3000"]'; $env:JWKS_URL="http://localhost:3000/api/auth/jwks"; $env:JWT_AUDIENCE="https://localhost:3000"; $env:JWT_ISSUER="https://localhost:3000"; cd frontend; npm run db:seed-wi"

reset-db:
    just fe run db:reset

serve-doc:
    mdbook serve --open
