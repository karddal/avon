# Backend setup

The backend runs on FastAPI. To install everything:

- Install [uv](https://docs.astral.sh/uv/). This is a Python project manager
- Run `just sync` to download and install dependencies (if you have not already done so)
- Setup the [environment variables](environment_variables.md)
- Run `just run-be` to start up the backend.