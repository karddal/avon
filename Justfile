set shell := ["bash", "-cu"]
set windows-shell := ["powershell.exe", "-NoProfile", "-Command"]

# helper
@fe cmd *args:
    just -f Justfile -d frontend {{cmd}}-fe {{args}}

@be cmd *args:
    just -f Justfile -d backend {{cmd}}-be {{args}}

@doc cmd *args:
    just -f Justfile -d documentation {{cmd}}-doc {{args}}

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

serve-book-doc:
    mdbook serve --open

seed-db:
    cd frontend && npm run db:seed

reset-db:
    cd frontend && npm run db:reset

serve-book:
    cd documentation && mdbook serve --open
