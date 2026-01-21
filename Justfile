set shell := ["bash", "-cu"]
set windows-shell := ["powershell.exe", "-NoProfile", "-Command"]

default:
    just --list

check-fe:
    @echo "Formatting and linting frontend..."
    just -f frontend/Justfile check

check-be:
    @echo "Formatting and linting backend..."
    just -f backend/Justfile check

check: check-fe check-be

fix-fe:
    @echo "Fixing frontend..."
    just -f frontend/Justfile fix

fix-be:
    @echo "Fixing backend..."
    just -f backend/Justfile fix

fixit: fix-fe fix-be

test-be:
	@echo "Testing backend routers..."
	just -f backend/Justfile test

run-fe:
    just -f frontend/Justfile run

run-be env:
    just -f backend/Justfile run {{env}}

sync:
    just -f frontend/Justfile sync
    just -f backend/Justfile sync

serve-book:
    just -f documentation/Justfile open