# Making branches

Once you've created your issue, you should create a linked branch. This will connect all the work you do to the issue. Name your branch something sensible, the convention we use is two or three words connected with hyphens, like this: `my-awesome-feature`.

Once created, you should use `git fetch origin` to update your local repo and `git checkout BRANCH_NAME` to change to your new branch. You're now ready to start work. Make sure to `git commit` regularly, and run `just check` and `just fixit` to make sure you are complying with code style requirements.
