# CI/CD

Avon has several CI/CD pipelines set up.

## Pull requests

Before a pull request can be merged, code quality checks must pass. The frontend uses the Biome linter, and the backend uses Ruff. In addition, tests are also run to make sure that they pass. Further, we have a PR labeller set up so that PRs are automatically labelled with the areas that they touch.

The frontend pull request workflow installs dependencies once, runs Biome, builds the Next.js app once with the e2e test environment, runs unit tests, then starts the backend and runs Cypress against the prebuilt standalone app. Cypress should use `npm run test:e2e:prebuilt` in CI so it does not run a second `next build`.

The workflow intentionally does not parallelise Cypress by default. Parallel Cypress jobs can reduce wall-clock time, but each runner repeats setup costs, so it should only be added after the single-runner path is measured and Cypress runtime is still the bottleneck.

## Deployment

On merges into main, GitHub will automatically build a docker image, publish to ECR and update the task manifests.
