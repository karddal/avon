# Test running system

The test running system is the main feature of Avon. This lets a lecturer run tests on student repos. The main flow is as follows:

- Coursework is created in the UI
- Template repo activated on GitLab, or ZIP file uploaded
- Engine configuration is set up, selecting a base image from the gallery and giving a testing command
- Repos provisioned by lecturer to all students
- Lecturer selects some repos to run tests for and starts a test run
- When a test run starts, the backend makes an API call to AWS ECS to run a test task for each repo
- On completion, the result is persisted and is visible in the UI

## Base images

A Base Image is a predefined configuration for a test run. It consists of a name, a description, and an AWS task definition name and revision. A Base Image can be deactivated by admins, which will hide it in the UI.

## Task definitions and containers

Task Definitions are defined in AWS for each testing configuration. Each task definition chooses a specific runner container.

For example, we might have a Python runner, or a Java runner. Each runner will install dependencies specific to the runner, such as build tools, test tools, etc. For Java, this could be installing Java 8, and gradle.

## How testing works

When a test container starts, it clones the git repository provided. It installs dependencies, and runs the command provided by the lecturer. Any logs produced by this command are stored, and uploaded to S3. When testing finishes, a notification message is sent to an SQS queue by the system. This SQS queue is consumed by backend instances, which update the database with testing status, and results for testing, such as the S3 key for the logs. 