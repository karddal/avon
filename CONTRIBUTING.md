# Contributing
This is a quick guide on how to contribute to Avon.

### Just command runner
The Just command runner is used to simplify our workflow and make commits easier.
To install it, follow the instructions on this page: [here](https://github.com/casey/just?tab=readme-ov-file#installation)

Once you have installed it, make sure you are in the root (i.e. the folder with README.md).
Here, you can use `just --list` to list all available commands.

| Command                   | Usecase                                                                |
|---------------------------|------------------------------------------------------------------------|
| `check`                   | Runs both frontend and backend checks, does not fix, just list issues. |
| `check-fe` and `check-be` | Runs either  frontend or backend checks, respectively. Does not fix.   |
| `fixit`                   | Fixes things flagged up for both frontend and backend.                 |
| ` fix-fe` and `fix-be`    | Fixes either frontend or backend                                       |

### Bun
Bun is a faster version of npm. Install instructions: [here](https://bun.com/).

Basically the same, but use `bunx` instead of `npx`.