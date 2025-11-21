# Contributing
Thanks for being interested in our project!
This is a quick guide on how to contribute to Avon.

## Internal / Team contributions

### Getting started
1. **Clone** the repository from GitHub locally.
2. Decide on how you wish to contribute.
3. Create an **issue** to track your contribution.
4. Ensure that you fill out the metadata for the issue.
5. Create a branch linked to the issue using GitHub's 'create a branch linked to this issue' feature.

### Dev environment
To set up a dev environment, follow these steps:

### Prerequisites
#### Bun
Bun is a package manager similar to npm, but a lot faster and more modern. Install it using the instructions [here](https://bun.com/).

#### NodeJS
Node.js is required for Next.js. We are currently using Node version >=20.9. Download [here](https://nodejs.org/en/download)

#### UV
UV is a package manager built for Python, handling virtual environments and other important development features. Install it [here](https://github.com/astral-sh/uv).

#### Python
Python is used for the FastAPI backend. It can be downloaded [here](https://www.python.org/downloads/). For Avon, we recommend versions 3.14 or above.

#### Just
Just is a command runner that we use to simplify our workflow and make commits easier.
To install it, follow the instructions on this page: [here](https://github.com/casey/just?tab=readme-ov-file#installation)

Pay particular attention to the instructions if you are using **Windows** because in order to use Just you will need to add Git Bash to your PATH.
There are instructions on the linked Just GitHub page.

Once you have installed it, make sure you are in the root (i.e. the folder with README.md).
Here, you can use `just --list` to list all available commands.

| Command                   | Usecase                                                                |
|---------------------------|------------------------------------------------------------------------|
| `check`                   | Runs both frontend and backend checks, does not fix, just list issues. |
| `check-fe` and `check-be` | Runs either  frontend or backend checks, respectively. Does not fix.   |
| `fixit`                   | Fixes things flagged up for both frontend and backend.                 |
| `fix-fe` and `fix-be`    | Fixes either frontend or backend                                       |
| `run-fe` and `run-be`   | Runs either frontend or backend.

#### Development Flow
1. Use `git pull` to make sure your local repo is up to date.
2. Use `git branch -a` to list all branches.
3. Use `git switch <BRANCH NAME>` to switch to your new branch created before.
4. `git commit` often!

##### Frontend
To run the frontend, use `bun run dev` from within the `frontend/` folder, or `just run-fe` from the root.

##### Backend
To run the backend, use `./gradlew bootRun` from within the `backend/` folder, or `just run-be` from the root.

##### Uploading your changes
Once you have made your changes, you must make sure that your code matches the code style of the project.
Use `just check` to run checks on your frontend and backend code. If there are any issues, you can try `just fixit` to fix the issues, but there are some
that may need to be fixed manually.
Create a `git commit` with a descriptive message, and `git push` to the branch. Once you are happy, you can create a pull request.

### Pull Requests
Before opening a Pull Request, please make sure you have done the following:
- Made a new branch for your feature/change (use a descriptive name)
- Keep the PR concice, only to the feature you plan to add.
- Test your code.
- If fixing an issue, make sure to state that your PR closes it.
- Ensure that you fill out the pull request metadata, and request reviews.




