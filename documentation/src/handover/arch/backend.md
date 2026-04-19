# Backend

Avon's backend is written using a framework for Python called FastAPI. It comes with an ORM called SQLModel which simplifies querying and updating the database.

The main data models in the backend are:

Programme
  : Organisational unit for Units, has a start and end date.

Unit
  : A Unit on a Programme. Has an owner lecturer, optionally other lecturers, and student members.

UnitEnrollment
  : A User connected to a Unit somehow (lecturer, student).

Coursework
  : A Unit can optionally have many Courseworks.

Other models that are used are:

BaseImage
  : The base image that the tests are on with docker
TestRun
  : Each test run including details of the repo, the timestamps etc
TestRunResult
  : The result of a test run including an exit code and link to the logs
Notification
  : A notification sent from one user to another user
StudentRepo
  : The repository information for a student