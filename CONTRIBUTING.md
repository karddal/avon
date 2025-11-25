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

#### Development Flow
1. Use `git pull` to make sure your local repo is up to date.
2. Use `git branch -a` to list all branches.
3. Use `git switch <BRANCH NAME>` to switch to your new branch created before.
4. `git commit` often!

##### Frontend
To run the frontend, use `bun run dev` from within the `frontend/` folder, or `just run-fe` from the root.

##### Backend
To run the backend, use `uv run fastapi dev` from within the `backend/` folder, or `just run-be` from the root.

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




