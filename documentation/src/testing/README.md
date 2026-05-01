# Testing

Currently, Avon has tests for the backend and frontend.

We use [Pytest](https://docs.pytest.org/en/stable/) for backend testing and [Cypress](https://www.cypress.io/) for frontend end-to-end tests.

## Backend tests

The testing works by setting up an in-memory sqlite database, so any tests performed have no effect. The application is mocked using routines provided by FastAPI.

To run backend tests use `just test-be`.

## Frontend tests

We use Cypress for frontend end-to-end tests. The shared Cypress commands live in `frontend/cypress/support/commands.ts`.

To run the full local frontend e2e flow, use `just test-fe`. This seeds the test database, builds the frontend with the e2e environment, starts the backend and frontend, then runs Cypress.

If a compatible e2e build already exists, use:

```bash
just fe test-e2e-prebuilt
```

To only create that build, use:

```bash
just fe build-e2e
```

CI uses this split path: it builds once with `just fe build-e2e`/`npm run build:e2e`, then runs Cypress with `npm run test:e2e:prebuilt` so Cypress does not pay for another `next build`.

Prefer `cy.login(...)` for authenticated tests. It uses Cypress session caching so specs do not repeat the full login flow unless the cached Better Auth session is invalid. Keep direct login-form assertions in the login spec so authentication itself remains covered.

Use `cy.resetDb()` only where isolation is needed. Read-only specs should reset once before the spec; mutation tests should reset at the start of the test if they depend on seeded state.

## All tests

To run all tests, use `just test`.
