# Testing

Currently, Avon has tests for the backend and frontend.

We use [Pytest](https://docs.pytest.org/en/stable/) for backend testing and [Cypress](https://www.cypress.io/) for backend tests.

## Backend tests

The testing works by setting up an in-memory sqlite database, so any tests performed have no effect. The application is mocked using routines provided by FastAPI.

To run backend tests use `just test-be`.

## Frontend tests

We use end-to-end tests using Cypress that mocks the browser. We are able to define what a page should look like. Please see the login page tests to see how to cache
the logged in state. The database is reset and seeded before every test, again see the login tests for an example.

Fixture setup now uses the backend test-only fixture API under `/testing/fixtures/*`.

This router is only mounted when `TESTING_MODE=True`, and every request must include the `X-Test-Fixture-Key` header. These routes are test infrastructure only. They are not part of the product API surface and should not be used by application code.

For Cypress, prefer the shared commands in `frontend/cypress/support/commands.ts`:
- `cy.testResetDomain()`
- `cy.testCreateProgramme(...)`
- `cy.testCreateUnit(...)`
- `cy.testCreateCoursework(...)`
- `cy.testEnrollStudents(...)`
- `cy.testEnrollLecturers(...)`

Use those helpers to create targeted state in the middle of a test instead of relying on `IGNORE_AUTH` or restarting the backend.

To run tests, use `just test-fe`. This will start up the backend.

## All tests

To run all tests, use `just test`.
