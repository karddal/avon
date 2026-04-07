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