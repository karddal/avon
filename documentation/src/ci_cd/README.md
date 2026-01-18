# CI/CD

Avon has several CI/CD pipelines set up.

## Pull requests

Before a pull request can be merged, code quality checks must pass. The frontend uses the Biome linter, and the backend uses Ruff. In addition, tests are also run to make sure that they pass. Further, we have a PR labeller set up so that PRs are automatically labelled with the areas that they touch.

## Deployment

On merges into main, GitHub will automatically build a docker image, publish to ECR and update the task manifests.
