# Testing

Currently, Avon has tests for the backend and frontend.

We use [Pytest](https://docs.pytest.org/en/stable/) for backend testing and [Cypress](https://www.cypress.io/) for backend tests.

## Backend tests

The testing works by setting up an in-memory sqlite database, so any tests performed have no effect. The application is mocked using routines provided by FastAPI.

To run backend tests use `just test-be`.

## Frontend tests

We use end-to-end tests using Cypress that mocks the browser. We are able to define what a page should look like. Please see the login page tests to see how to cache
the logged in state. The database is reset and seeded before every test, again see the login tests for an example.

When writing tests, you should add routes to the test endpoint to allow seeding specific data to the database, so that you can simulate the right state.

To run tests, use `just test-fe`. This will start up the backend.

## All tests

To run all tests, use `just test`.
