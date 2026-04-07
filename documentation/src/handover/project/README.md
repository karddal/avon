# Project structure

|Folder          | Description|
|----------------|---------------|
|`frontend/`     |contains frontend code|
|`backend/`      |contains backend code|
|`documentation/`| contains the source for the mdBook docs|
|`engine/`       |contains the source for each test runner|
|`.github/`      |contains CI workflows|
|`.aws/`         |contains definitions used by CI workflows to deploy the frontend and backend|

## Frontend structure

|Folder          | Description|
|----------------|---------------|
|`public/`     |static assets|
|`cypress/`     |tests|
|`src/app`      |contains app structure|
|`src/components`| contains shadcn and custom components|
|`lib/`       |contains library code|

## Backend structure

|Folder          | Description|
|----------------|---------------|
|`app/core`     |helpers, authentication, gitlab|
|`app/db`      |database connection|
|`app/models`| data model classes|
|`app/notifications/`       |notifications system|
|`app/routers/`       |route definitions|
|`app/schemas/`       |response schema definitions|
|`app/notifications/`       |notifications system|
|`app/sqs_worker.py/`       |test running system queue worker|
|`app/main.py`       |entrypoint|
|`tests/`       |tests|
