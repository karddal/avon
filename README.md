# Continuous Assessment for Revision Control

![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white) ![AWS](https://img.shields.io/badge/aws-%23232f3e.svg?style=for-the-badge&logo=amazon-web-services&logoColor=white)

**Continuous Assessment for Revision Control (CARC)** is a **Virtual Learning Environment (VLE)** allowing lecturers to track the progress of students through coursework.
  
## Contents

- [Overview](#overview)
- [Important Links](#important-links)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
	- [Prerequisites](#prerequisites)
	- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Stakeholders](#stakeholders)
- [User Stories](#user-stories)
- [Flow Steps](#flow-steps)
- [Team Members](#team-members)
- [Contributing](#contributing)


## Overview

## Important Links

[Figma](https://www.figma.com/design/0GAtKL9idVkkgqkVF0u59z/CARC?node-id=0-1&p=f&t=6Tt63sBXywwS4rsh-0) - Logo - Important Docs - Flowcharts - ER Diagrams - [Kanban Board](https://github.com/orgs/spe-uob/projects/309/views/1?layout_template=board)

## Tech Stack

#### Frontend
[Next.js
](https://nextjs.org/)
#### Backend
[Springboot](https://spring.io/projects/spring-boot)

#### Tools & Libraries
Easy command running - [Just](https://github.com/casey/just)

#### Servers

#### Database

#### Linter(s)
Typescript - [Biome](https://biomejs.dev/)

#### CI/CD

#### Testing

#### Caching [?]

## Installation

### Prerequisites

### Running Locally

## Project Structure

## Stakeholders

**Client**: [School of Computer Science (Mike Fraser and Tilo Berghardt)](https://www.bristol.ac.uk/science-engineering/schools/computer-science/)

### Typical Stakeholders

**End users**: Students, Lecturers/Unit Directors

- <u>Students</u>: Should be able to access their assigned coursework, collaborate with other classmates in group tasks, and have version control capabilities of their projects.
- <u>Lecturers/Unit Directors</u>: Should be able to view the coursework for all the students in their cohort. They should be able to see how their students have progressed with their work. They should be able to grade their work. 

**Organisation and System Managers**: Unit Directors


## User Stories

As a *Student*, I want to have an easier and less stressful way to upload my coursework and projects either via the command line or online, as it will remove the sense of panic and lack of confidence in my near-deadline submissions.

As a *Student*, I want to be able to work easily with my classmate on an assigned coursework task, so I can spend more time working and less time organising files.

As a *Lecturer*, I want to be able to click a button called '*Create Coursework*' that takes me to a form that allows me input details for the coursework, including name, description, deadline etc. I should be able to then send an invite link to all my students via email that allows them to join the coursework and work on their projects. This simplifies the process of me setting up a project and simplifies the process of my students joing the project.

As a *Lecturer*, I want a way to view the timeline of updates in a coursework, to see how organised each student is, and how they are getting along with their project.

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


## Team Members

| Members             | Email                                                   |
| ------------------- | ------------------------------------------------------- |
| Hrushikesh Emkay    | [fw24131@bristol.ac.uk](mailto:fw24131@bristol.ac.uk)   |
| Josh Jenkins        | [is24788@bristol.ac.uk](mailto:is24788@bristol.ac.uk)   |
| Yuxuan Wang         | [om23078@bristol.ac.uk](mailto:om23078@bristol.ac.uk)   |
| Mihaly Toth-Tarsoly | [wq24423@bristol.ac.uk](mailto:WQ24423@bristol.ac.uk)   |
| Jack Dempsey        | [wm24026@bristol.ac.uk](mailto:WM24026@bristol.ac.uk)   |

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md)

