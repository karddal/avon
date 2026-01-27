<img width="130.25" height="58.25" alt="image" src="https://github.com/user-attachments/assets/2f90f327-63be-414f-a275-8091d4f76e3e" />

# Continuous Assessment for Revision Control

[![Deploy Backend to Amazon ECS](https://github.com/spe-uob/2025-ContinuousAssessment/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/spe-uob/2025-ContinuousAssessment/actions/workflows/deploy-backend.yml)
[![Deploy Frontend to Amazon ECS](https://github.com/spe-uob/2025-ContinuousAssessment/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/spe-uob/2025-ContinuousAssessment/actions/workflows/deploy-frontend.yml)

[![Deploy docs site](https://github.com/spe-uob/2025-ContinuousAssessment/actions/workflows/mdbook.yml/badge.svg)](https://github.com/spe-uob/2025-ContinuousAssessment/actions/workflows/mdbook.yml)
[![Frontend Lints, Tests](https://github.com/spe-uob/2025-ContinuousAssessment/actions/workflows/frontend.yml/badge.svg)](https://github.com/spe-uob/2025-ContinuousAssessment/actions/workflows/frontend.yml)
[![Backend Lints, Tests](https://github.com/spe-uob/2025-ContinuousAssessment/actions/workflows/backend.yml/badge.svg)](https://github.com/spe-uob/2025-ContinuousAssessment/actions/workflows/backend.yml)

![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white) ![AWS](https://img.shields.io/badge/aws-%23232f3e.svg?style=for-the-badge&logo=amazon&logoColor=white) ![GitLab](https://img.shields.io/badge/GitLab-FC6D26?style=for-the-badge&logo=gitlab&logoColor=white) ![Next.JS](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-009485.svg?style=for-the-badge&logo=fastapi&logoColor=white)

**Continuous Assessment for Revision Control (CARC)** is a **Virtual Learning Environment (VLE)** allowing lecturers to track the progress of students through coursework.

View the [docs site](https://cautious-adventure-gz73j3v.pages.github.io/).

## Contents

- [Continuous Assessment for Revision Control](#continuous-assessment-for-revision-control)
  - [Contents](#contents)
  - [Important Links](#important-links)
  - [Tech Stack](#tech-stack)
  - [Project Description](#project-description)
  - [Stakeholders](#stakeholders)
    - [Students](#students)
    - [Lecturers, Unit directors](#lecturers-unit-directors)
  - [User Stories](#user-stories)
    - [Student](#student)
    - [Lecturer](#lecturer)
  - [Flow Steps](#flow-steps)
    - [Student](#student-1)
      - [Starting work on a new coursework](#starting-work-on-a-new-coursework)
      - [Working on a coursework](#working-on-a-coursework)
    - [Lecturer:](#lecturer-1)
      - [Assigning coursework](#assigning-coursework)
      - [Marking coursework](#marking-coursework)
      - [Analytics](#analytics)
  - [Project structure](#project-structure)
    - [Frontend](#frontend-tree)
    - [Backend](#backend-tree)
  - [Developer Instructions](#developer-instructions)
    - [Prerequisites](#prerequisites)
      - [NPM](#npm)
      - [NodeJS](#nodejs)
      - [UV](#uv)
      - [Python](#python)
      - [Just](#just)
    - [Setup / Installing Dependencies](#setup--installing-dependancies)
    - [Running](#running)
      - [Environment Variables](#environment-variables)
      - [Final Steps](#final-steps)
      - [Contributing](#contributing)
  - [Team Members](#team-members)
  - [Architecture Diagram](#architecture-diagram)

## Important Links

| [Figma](https://www.figma.com/design/0GAtKL9idVkkgqkVF0u59z/CARC?node-id=0-1&p=f&t=6Tt63sBXywwS4rsh-0) | ER Diagrams | [Kanban Board](https://github.com/orgs/spe-uob/projects/309/views/1?layout_template=board) |
| ------------------------------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------ |

## Tech Stack

| Category       | Tech                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------- |
| Frontend       | [Next.js](https://nextjs.org/), [TailwindCSS](https://tailwindcss.com/)                     |
| Backend        | [FastAPI](https://fastapi.tiangolo.com/)                                                    |
| Database       | [PostgreSQL](https://www.postgresql.org/)                                                   |
| Linters        | [Biome](https://biomejs.dev/), [Ruff](https://github.com/astral-sh/ruff)                    |
| Tools          | [Just](https://github.com/casey/just), [Git](https://git-scm.com/), [NPM](https://npmjs.com/) |
| Infrastructure | [AWS](https://aws.amazon.com)                                                               |

## Project Description

CARC aims to be a VLE that works with staff and students, rather than against them. The goal is to have a system that allows lecturers to view the progress of students _as_ they progress through the coursework, allowing
measurement of performance _throughout_ coursework completion, rather than just at the end.
CARC also aims to relieve some small measure of the frustration felt with current systems; by allowing all common tasks to be conducted from within the same place, automatically. The project was conceived because the clients realised that having a more fulsome understanding of the process taken to complete courseworks would allow more accurate and fair evaluation of students. In addition, there are plans to perhaps be able to deal with the threat that AI poses to traditional academic assignments, by embracing it. For example, courseworks can be split into stages that are assessed separately, and the contributions by humans and AI weighed up to decide on a final result.

A modern, responsive Next.JS frontend designed to be fast and lightweight consumes an API exposed by a modular FastAPI backend. In the future, we will potentially integrate with a system being designed in parallel by a University team. As such, we are going to write extensive documentation to allow for code re-use. The backend (FastAPI) was chosen for this purpose.

## Stakeholders

**Client**: [School of Computer Science (Mike Fraser and Tilo Burghardt)](https://www.bristol.ac.uk/science-engineering/schools/computer-science/)

**End users**: Students, Lecturers/Unit Directors

### Students

- Students will be added to the system by a lecturer or other system admin, and assigned to various units. They will be able to view announcements for units, check deadlines, and view their marks.
- Students will primarily use the system to check and complete any courseworks set by lecturers. They will see instructions for accessing the repository for storing their submission, and be able to check the skeleton code provided.
- Goals for a more advanced system include the ability for multiple students to work on the same submission together as a group, and to have their individual contributions be analysed and properly taken into account.
- Students should also be able to run certain tools on their assignment, such automated tests.

### Lecturers, Unit directors

- Lecturers and unit directors will set and manage coursework. These users will assign it to a particular _unit_. These units will be created either automatically or manually.
- Lecturers should be able to track the progress of all their students through a particular coursework in a convenient way, and the system should give them access to tools like running auto-marking scripts, and perhaps plagiarism detection.
- Broader analytics features could also be available, such as the time spent on particular courseworks on average, or average mark, etc. This helps lecturers by being able to easily see where students struggle, and where perhaps extra class time would be helpful. This is only possible due to the deep integration CARC has with Git - we can track individual lines of code and specific tests from the test suites.
- The most important goal of the system is to make lecturers' lives easier. This means that all design decision are made from this perspective.

## User Stories

### Student

- I want to have an easier and less stressful way to upload my coursework and projects as it will remove the sense of panic and lack of confidence in my near-deadline submissions.

- I want to be able to work easily with my classmate on an assigned coursework task, so I can spend more time working and less time organising files. I want to be able to run tools like automarking scripts easily, so that I know that I have correctly done the coursework.

- I want to be able to upload my coursework without having to worry about very specific folder naming.

- I want a fast interface because other websites are often very slow and clunky, or hard to navigate.

- I would like to see all of my units as soon as I login, to easily access their content.

- I would like to view all of my active courseworks, and be able to filter between finished ones and ongoing.

- I would like to have a notification area so I can be informed of when new courseworks or content is added to a unit.

### Lecturer

- I want to speed up the process of marking and evaluating coursework, which currently involves manual zipping, unzipping and running of test suites.

- I want an easier UI to digest and organise, in order for coursework and unit creation to be more straight foward.

- I want a way to view the timeline of updates in a coursework, to see how organised each student is, and how they are getting along with their project. I would like to see the progression of a coursework, rather than just the end result.

- I would like to know where my students struggle the most, so that I can best support them, such as which tests were most difficult to pass.

- I would like to have a dashboard where I can see statistics based on data from the last week or month, allowing me to check on my students and see how they are getting on.

## Flow Steps

#### Student

1. Logs in using Single Sign On or a username/password combination.
2. Can view their units and active courseworks, including for previous years.
3. Can check announcements and notifications for events like a new coursework being posted, or updates to marking.

##### Starting work on a new coursework

1. Opens the new coursework.
2. Receives instructions on how to set up access to the repository, and how to work on their coursework, committing regularly.
3. System allocates each student a separate repo automatically.

##### Working on a coursework

1. While working on a coursework, students are able to run tasks on the code they have submitted.
2. This includes auto-marking test suites.

#### Lecturer:

1. Logs in online using their University of Bristol Microsoft account via Single-Sign-On (SSO) or username/password.

##### Assigning coursework

1. Creates a new repository for an upcoming coursework task.
2. If applicable, upload skeleton code/outline of task.
3. Assign coursework to all users/teams of users, specifying a start and end date.
4. Monitor progress and commit history of individual students via their dashboard.

##### Marking coursework

1. If using an automarker, the lecturer can automatically see the marks for every student in their markbook.
2. Lecturers can examine the entire history of a coursework's completion and relevant timestamps to see where students have struggled.
3. Lecturers can run tools like plagiarism detectors.

##### Analytics

1. Analytics tools are available to extract useful insights from coursework completion.
2. These could include relative 'difficulty' scores based on previous years, average number of tests passed, etc.

## Project structure

- `/documentation` contains the source for the mdBook documentation website.
- `/docs` contains miscellaneous documentation and agendas.
- `Justfile` is a configuration file for the Just command runner, containing custom scripts to make collaboration easier.
- `README.md` - you are here :)
- `CONTRIBUTING.md` contains information on how to contribute to the project.
- `/backend` contains the FastAPI backend code.
- `/frontend` contains the NextJS frontend code.
- `devenv` stuff - Nix stuff related to the `devenv` tool some team members use locally for nice local environments.
- `.envrc` - used for devenv, automatically activates the devenv when you cd into folder if set up locally.


### Frontend tree

```
└── frontend/
    ├── public/                   # Static assets (icons, images, etc.)
    ├── node_modules/             # Libraries
    ├── src/                      # Main application source
    │   ├── app/                  # Next.js app directory (routes + layouts)
    │   │   ├── (page name)/      # Specific page routes
    │   │   │   └── (sub page)/   # Nested routes if needed
    │   │   ├── layout.tsx        # Root layout
    │   │   ├── page.tsx          # Root page
    │   │   ├── globals.css       # Global styles
    │   │   └── favicon.ico       # App icon
    │   ├── components/           # Reusable components
    │   │   └── ui/               # ShadCN UI components
    │   ├── hooks/                # Custom React hooks
    │   ├── scripts/              # Custom dev scripts e.g. for seeding the database
    │   ├── temporary/            # Temporarily removes pages that need to be refactored
    │   └── lib/                  # Utility and helper functions
    ├── .gitignore                # Git ignore rules
    ├── biome.json                # Linter ignore rules
    ├── components.json           # Shadcn configuration
    ├── docker-compose.yaml       # Docker-compose for frontend
    ├── Dockerfile                # Dockerfile for frontend
    ├── next.config.ts            # Nextjs configuration
    ├── package.json              # Dependency configuration and npm config
    └── package.lock.json         # Dependency lock file (npm)
```

### Backend tree

```
└── backend/
    ├── app/
    │   ├── main.py               # Main FastAPI entrypoint
    │   ├── core/                 # Core utilities (config, security, types)
    │   ├── db/                   # Database session and connection setup
    │   ├── models/               # SQLAlchemy ORM models
    │   ├── routers/              # API route handlers (auth, user, unit, etc.)
    │   ├── schemas/              # Pydantic schemas for request/response models
    │   └── __init__.py
    ├── tests/                    # Pytest test suite (unit + integration)
    │   ├── model/                # Model tests
    │   ├── router/               # Endpoint tests
    │   ├── schemas/              # Schema validation tests
    │   ├── security/             # Auth/security-related tests
    │   └── conftest.py           # Test environment setup
    ├── .gitignore                # Git ignore rules
    ├── pyproject.toml            # Project metadata + dependencies
    ├── pytest.ini                # Pytest config
    ├── docker-compose.yaml       # Docker-compose for backend
    ├── Dockerfile                # Dockerfile for backend
    └── uv.lock                   # Dependency lock file (uv)
```

## Developer Instructions

Here is how to setup a local development version of Avon on your machine. More in-depth instructions can be seen in the Documentation Website.

### Prerequisites

#### NPM

NPM is a package manager for Nodejs. Install it using the instructions [here](https://npmjs.com/).

#### NodeJS

Node.js is required for Next.js. We are currently using Node version >=25. Download [here](https://nodejs.org/en/download)

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
| ------------------------- | ---------------------------------------------------------------------- |
| `check`                   | Runs both frontend and backend checks, does not fix, just list issues. |
| `check-fe` and `check-be` | Runs either frontend or backend checks, respectively. Does not fix.    |
| `fixit`                   | Fixes things flagged up for both frontend and backend.                 |
| `fix-fe` and `fix-be`     | Fixes either frontend or backend                                       |
| `run-fe` and `run-be`     | Runs either frontend or backend.                                       |

### Setup / Installing Dependancies

To begin, clone the repository.

```
git clone git@github.com:spe-uob/2025-ContinuousAssessment
```

Before starting work, you need to install all the required packages.

For the **frontend**, enter the `frontend` folder and execute `npm install` to fetch all dependencies..

For the **backend**, enter the `backend` folder, create a virtual environment using `uv venv`, activate the environment, and then run `uv sync` to install all packages.
Other commands such as `uv add` can be used to add packages to the project.

### Running

#### Environment Variables

**Frontend:**
in `.env.development`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000       # the url of the backend api
ENV=development                                 # environment type
BETTER_AUTH_SECRET={RANDOM SECRET}              # better auth secret to use
BETTER_AUTH_URL=https://localhost:3000          # better auth url to bind to
```


**Backend:**
in `.env.dev`

```
DATABASE_URL="sqlite:///../sqlite.db"           # the location of the database to access (for local dev, share with frontend)
CORS_ORIGIN=["http://localhost:3000"]           # the cors origins to allow
JWKS_URL="http://localhost:3000/api/auth/jwks"  # jwk url that can be fetched from (get from frontend)
JWT_AUDIENCE="https://localhost:3000"           # jwt audience, set in frontend
JWT_ISSUER="https://localhost:3000"             # jwt issuer, from frontend
```

#### Final Steps

To run the frontend, simply run `just run-fe` in the project root.

Similarly, to run the backend, run `ENV=dev just run-be` if using `.env.dev`.

Now you should be able to visit `http://localhost:3000` and view the frontend Next.js app, with the backend running on`http://localhost:8000`.

#### Contributing

Thanks for being interesting in helping our project!

To contribute see [CONTRIBUTING.md](CONTRIBUTING.md).

## Team Members

| Members             | Email                                                 |
| ------------------- | ----------------------------------------------------- |
| Hrushikesh Emkay    | [fw24131@bristol.ac.uk](mailto:fw24131@bristol.ac.uk) |
| Josh Jenkins        | [is24788@bristol.ac.uk](mailto:is24788@bristol.ac.uk) |
| Yuxuan Wang         | [om23078@bristol.ac.uk](mailto:om23078@bristol.ac.uk) |
| Mihaly Toth-Tarsoly | [wq24423@bristol.ac.uk](mailto:wq24423@bristol.ac.uk) |
| Jack Dempsey        | [wm24026@bristol.ac.uk](mailto:wm24026@bristol.ac.uk) |

## Architecture Diagram

<img width="2743" height="4275" alt="Blank diagram" src="https://github.com/user-attachments/assets/eb254416-470f-4a1f-88cc-cac42fa51883" />
