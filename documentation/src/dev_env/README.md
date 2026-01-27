# Setting up a local dev environment

To set up a local dev environment, you will need to  install a few tools. We use these to speed up development.

There are two main options. If you have a Nix environment set up, you can use the instructions on the [devenv website](https://devenv.sh/getting-started/) to install `devenv`.
Then, just cd into the folder, and all the dependencies will be set up and ready to go for you. You just need to look at the environment variable instructions.

If not, then look at the instructions and install manually.

## Just

The most important thing to use is [Just](https://just.systems/man/en/). Just is a _command runner_, that allows us to speed up common tasks and scripts.

To install it, follow the relevant instructions for your platform. Once it is installed, you can issue `just` commands _anywhere in the repository_!

Some of the most useful `just` commands are tabulated below, although all commands can be listed using `just --list`:


| Command      | Purpose                           |
|--------------|-----------------------------------|
| `just check` | Runs linters                      |
| `just fixit` | Fixes issues                      |
| `just sync`  | Download and install dependencies |

---

### Command Targets

Different targets (frontend, backend, and docs) support different commands.

- **Frontend:** `just fe <cmd>`
- **Backend:** `just be <cmd>`
- **Docs:** `just doc <cmd>`

---

### Available Commands
The tables below list the available commands for each target.


### Frontend Commands

| Command             | Purpose                           |
|---------------------|-----------------------------------|
| `just fe run <env>` | Runs the frontend                 |
| `just fe sync`      | Download and install dependencies |
| `just fe fix`       | Fixes issues                      |
| `just fe check`     | Runs linter                       |
| `just fe build`     | Build for production              |

#### Environment Options

The `<env>` parameter specifies which environment to run the frontend in.

If omitted, it defaults to `dev`.

| Value   | Description             |
|---------|-------------------------|
| `dev`   | Development environment |
| `start` | Production environment  |

---

### Backend Commands

| Command             | Purpose                                       |
|---------------------|-----------------------------------------------|
| `just be run <env>` | Runs the backend in the specified environment |
| `just be test`      | Runs tests                                    |
| `just be sync`      | Download and install dependencies             |
| `just be fix`       | Fixes issues                                  |
| `just be check`     | Runs linter                                   |

#### Environment Options

The `<env>` parameter specifies which environment to run the backend in.

If omitted, it defaults to `dev`.

| Value     | Description               |
|-----------|---------------------------|
| `dev`     | Development environment   |

---

### Docs Commands

| Command               | Purpose            |
|-----------------------|--------------------|
| `just doc serve-book` | open documentation |

---

Please follow the rest of the instructions in this chapter to setup the tools for running the frontend and the backend.

## Docker

Some of our workflows use Docker, because we containerise our platform. This means that you should install Docker or a Docker-compatible runtime, like
Podman.

## Local db setup

To seed a local db for development use, see the just commands above.