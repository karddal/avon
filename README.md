# Continuous Assessment for Revision Control

![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white) ![AWS](https://img.shields.io/badge/aws-%23232f3e.svg?style=for-the-badge&logo=amazon-web-services&logoColor=white)

**Continuous Assessment for Revision Control (CARC)** is a **Virtual Learning Environment (VLE)** allowing lecturers to track the progress of students through coursework.
  
## Contents

- [Important Links](#important-links)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
	- [Prerequisites](#prerequisites)
	- [Running Locally](#running-locally)
- [Project Description](#project-description)
- [Stakeholders](#stakeholders)
- [User Stories](#user-stories)
- [Flow Steps](#flow-steps)
- [Project Structure](#project-structure)
- [Team Members](#team-members)
- [Contributing / Developer Instructions](#contributing--developer-instructions)

## Important Links

- [Figma](https://www.figma.com/design/0GAtKL9idVkkgqkVF0u59z/CARC?node-id=0-1&p=f&t=6Tt63sBXywwS4rsh-0)
- ER Diagrams (tbd)
- [Kanban Board](https://github.com/orgs/spe-uob/projects/309/views/1?layout_template=board)

## Tech Stack

[Next.js](https://nextjs.org/) frontend, [Spring Boot](https://spring.io/projects/spring-boot) backend.

#### Tools & Libraries
We use the [Just](https://github.com/casey/just) command runner to simplify the collaboration workflow. See the instructions in CONTRIBUTING.md

#### Database
PostgreSQL

#### Linter(s)
- Typescript: [Biome](https://biomejs.dev/)
- Java: [Spotless](https://github.com/diffplug/spotless)

## Installation

### Prerequisites

### Running Locally

## Project Description

CARC aims to be a VLE that works with staff and students, rather than against them. The goal is to have a system that allows lecturers to view the progress of students _as_ they progress through the coursework, allowing
measurement of performance _throughout_ coursework completion, rather than just at the end.
CARC also aims to relieve some small measure of the frustration felt with current systems; by allowing all common tasks to be conducted from within the same place, automatically. This will save time and reduce frustration for both lecturers, and students.

## Stakeholders

**Client**: [School of Computer Science (Mike Fraser and Tilo Berghardt)](https://www.bristol.ac.uk/science-engineering/schools/computer-science/)

**End users**: Students, Lecturers/Unit Directors
### Students

Students will use the system to view assigned coursework, track their progress throughout completion, and upload their finished product. 
Goals for a more advanced system include the ability for multiple students to work on the same submission together as a group. 
Students should also be able to run certain tools on their assignment, such automated tests.

### Lecturers, Unit directors

Lecturers and unit directors will set and manage coursework. These users will assign it to a particular 
_unit_. These units will be created either automatically or manually. 
Lecturers should be able to track the progress of all their students through a particular coursework in a convenient way, and the system should give them access to tools like running auto-marking scripts, and perhaps plagiarism detection.
Broader analytics features could also be available, such as the time spent on particular courseworks on average, or average mark, etc.

## User Stories

As a *Student*, I want to have an easier and less stressful way to upload my coursework and projects either via the command line or online, as it will remove the sense of panic and lack of confidence in my near-deadline submissions.

As a *Student*, I want to be able to work easily with my classmate on an assigned coursework task, so I can spend more time working and less time organising files. I want to be able to run tools like automarking scripts easily.

As a *Lecturer*, I want to be able to click a button called '*Create Coursework*' that takes me to a form that allows me input details for the coursework, including name, description, deadline etc. I should be able to then send an invite link to all my students via email that allows them to join the coursework and work on their projects. This simplifies the process of me setting up a project and simplifies the process of my students joing the project.

As a *Lecturer*, I want a way to view the timeline of updates in a coursework, to see how organised each student is, and how they are getting along with their project.

As a *Lecturer*, I want to spend less time zipping and unzipping folders and running scripts manually.

## Flow Steps

#### Student

1. Receives notification for coursework assignment
2. Logs in online using their University of Bristol Microsoft account via Single-Sign-On (SSO).
3. View all their pending coursework, their completed coursework and graded coursework throughout the course of their studies.
4. Can click on a pending coursework and see all their previous commits
5. Can click on one of their previous commits and view what they have done
6. Can click on a button that says 'upload commit' and it creates a new commit on their branch.

#### Lecturer:
1. Logs in online using their University of Bristol Microsoft account via Single-Sign-On (SSO).
2. Creates a new repository for an upcoming coursework task.
3. If applicable, upload skeleton code/outline of task.
4. Assign coursework to all users/teams of users, specifying a start and end date.
5. Monitor progress and commit history of individual students via their dashboard.

## Project structure
- `/frontend` contains the frontend code
- `/backend` contains the backend code
- `/Agendas` contains agendas for meetings
- the `Justfile` is a configuration file for the Just command runner, containing custom scripts to make collaboration easier.
- `README.md` - you are here :)
- `CONTRIBUTING.md` contains information on how to contribute to the project.

## Team Members

| Members             | Email                                                   |
| ------------------- | ------------------------------------------------------- |
| Hrushikesh Emkay    | [fw24131@bristol.ac.uk](mailto:fw24131@bristol.ac.uk)   |
| Josh Jenkins        | [is24788@bristol.ac.uk](mailto:is24788@bristol.ac.uk)   |
| Yuxuan Wang         | [om23078@bristol.ac.uk](mailto:om23078@bristol.ac.uk)   |
| Mihaly Toth-Tarsoly | [wq24423@bristol.ac.uk](mailto:WQ24423@bristol.ac.uk)   |
| Jack Dempsey        | [wm24026@bristol.ac.uk](mailto:WM24026@bristol.ac.uk)   |

## Contributing / Developer Instructions
See [CONTRIBUTING.md](CONTRIBUTING.md)

