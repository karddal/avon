# Testing

Currently, Avon only has tests for the backend. This may change in the future, but for now, the only testing framework used is [Pytest](https://docs.pytest.org/en/stable/).

The testing works by setting up an in-memory sqlite database, so any tests performed have no effect. The application is mocked using routines provided by FastAPI.

To run tests, use `just test`.
