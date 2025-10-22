# Continuous Assessment for Revision Control

![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white) ![AWS](https://img.shields.io/badge/aws-%23232f3e.svg?style=for-the-badge&logo=amazon&logoColor=white) ![GitLab](https://img.shields.io/badge/GitLab-FC6D26?style=for-the-badge&logo=gitlab&logoColor=white) ![Next.JS](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![Spring Boot](https://img.shields.io/badge/Spring-6DB33F?style=for-the-badge&logo=spring&logoColor=white)

**Continuous Assessment for Revision Control (CARC)** is a **Virtual Learning Environment (VLE)** allowing lecturers to track the progress of students through coursework.
  
## Contents

- [Important Links](#important-links)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Project Description](#project-description)
- [Stakeholders](#stakeholders)
- [User Stories](#user-stories)
- [Flow Steps](#flow-steps)
- [Project Structure](#project-structure)
- [Team Members](#team-members)
- [Contributing / Developer Instructions](#contributing--developer-instructions)
- [Architecture Diagram](#architecture-diagram)

## Important Links

| [Figma](https://www.figma.com/design/0GAtKL9idVkkgqkVF0u59z/CARC?node-id=0-1&p=f&t=6Tt63sBXywwS4rsh-0)  | ER Diagrams | [Kanban Board](https://github.com/orgs/spe-uob/projects/309/views/1?layout_template=board)
|--------|-------------|---------

## Tech Stack

| Category  | Tech |
|-----------|------|
| Frontend  | [Next.js](https://nextjs.org/), TailwindCSS  |
| Backend   | [Spring Boot](https://spring.io/projects/spring-boot) |
| Database  | [PostgreSQL](https://www.postgresql.org/) |
| Linters   | [Biome](https://biomejs.dev/), [Spotless](https://github.com/diffplug/spotless)
| Tools     | [Just](https://github.com/casey/just), [Git](https://git-scm.com/), [Bun](https://bun.dev/) |
| Infrastructure | [AWS](https://aws.amazon.com), [Vercel](https://vercel.com)

## Installation
See [CONTRIBUTING.md](CONTRIBUTING.md)

## Project Description

CARC aims to be a VLE that works with staff and students, rather than against them. The goal is to have a system that allows lecturers to view the progress of students _as_ they progress through the coursework, allowing
measurement of performance _throughout_ coursework completion, rather than just at the end.
CARC also aims to relieve some small measure of the frustration felt with current systems; by allowing all common tasks to be conducted from within the same place, automatically. The project was conceived because the clients realised that having a more fulsome understanding of the process taken to complete courseworks would allow more accurate and fair evaluation of students. In addition, there are plans to perhaps be able to deal with the threat that AI poses to traditional academic assignments, by embracing it. For example, courseworks can be split into stages that are assessed separately, and the contributions by humans and AI weighed up to decide on a final result.

A modern, responsive Next.JS frontend designed to be fast and lightweight consumes an API exposed by a modular Spring Boot backend, organised using the Hexagonal architecture.

## Stakeholders

**Client**: [School of Computer Science (Mike Fraser and Tilo Berghardt)](https://www.bristol.ac.uk/science-engineering/schools/computer-science/)

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

### Lecturer

- I want to speed up the process of marking and evaluating coursework, which currently involves manual zipping, unzipping and running of test suites.

- I want a way to view the timeline of updates in a coursework, to see how organised each student is, and how they are getting along with their project. I would like to see the progression of a coursework, rather than just the end result.

- I would like to know where my students struggle the most, so that I can best support them, such as which tests were most difficult to pass.

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
### Frontend
`/frontend` contains the frontend code
```
└── frontend/
    ├── public/
    │   └── (assets)
    ├── src/
    │   ├── app/
    │   │   ├── (page name)/
    │   │   │   └── (sub page name)/
    │   │   ├── .../
    │   │   ├── page.tsx
    │   │   ├── layout.tsx
    │   │   ├── globals.css
    │   │   └── favicon.ico 
    │   ├── components/
    │   │   ├── (our components)
    │   │   └── ui/
    │   │       └── (shadcn)
    │   ├── hooks
    │   └── lib
    ├── .gitignore
    └── bun.lock (dependency list)
```
- `/backend` contains the backend code
- `/Agendas` contains agendas for meetings
- `Justfile` is a configuration file for the Just command runner, containing custom scripts to make collaboration easier.
- `README.md` - you are here :)
- `CONTRIBUTING.md` contains information on how to contribute to the project.

## Team Members

| Members             | Email                                                   |
| ------------------- | ------------------------------------------------------- |
| Hrushikesh Emkay    | [fw24131@bristol.ac.uk](mailto:fw24131@bristol.ac.uk)   |
| Josh Jenkins        | [is24788@bristol.ac.uk](mailto:is24788@bristol.ac.uk)   |
| Yuxuan Wang         | [om23078@bristol.ac.uk](mailto:om23078@bristol.ac.uk)   |
| Mihaly Toth-Tarsoly | [wq24423@bristol.ac.uk](mailto:wq24423@bristol.ac.uk)   |
| Jack Dempsey        | [wm24026@bristol.ac.uk](mailto:wm24026@bristol.ac.uk)   |

## Architecture Diagram
<img width="3019" height="4013" alt="architecture" src="https://github.com/user-attachments/assets/0d617d6a-55b5-40a7-ac64-a5d919f4ff60" />



## Contributing / Developer Instructions
See [CONTRIBUTING.md](CONTRIBUTING.md)

