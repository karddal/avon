# Setting up a local dev environment

To set up a local dev environment, you will need to  install a few tools. We use these to speed up development.

There are two main options. If you have a Nix environment set up, you can use the instructions on the [devenv website](https://devenv.sh/getting-started/) to install `devenv`.
Then, just cd into the folder, and all the dependencies will be set up and ready to go for you. You just need to look at the environment variable instructions.

If not, then look at the instructions and install manually.

## Just

The most important thing to use is [Just](https://just.systems/man/en/). Just is a _command runner_, that allows us to speed up common tasks and scripts.

To install it, follow the relevant instructions for your platform. Once it is installed, you can issue `just` commands _anywhere in the repository_!

Some of the most useful `just` commands are tabulated below, although all commands can be listed using `just --list`:

|Command|Purpose|
|--------|-------|
|`just check`|Runs linters|
|`just fixit`|Fixes issues|
|`just run-fe`|Runs the frontend|
|`just run-be`|Runs the backend|
|`just test`|Runs tests|
|`just sync`|Download and install dependencies|

Please follow the rest of the instructions in this chapter to setup the tools for running the frontend and the backend.

## Docker

Some of our workflows use Docker, because we containerise our platform. This means that you should install Docker or a Docker-compatible runtime, like
Podman.
