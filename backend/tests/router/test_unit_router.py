
from uuid import uuid4
from sqlmodel import select
from datetime import datetime, timedelta
from app.models.coursework import Coursework
from app.models.programme import Programme
from app.models.unit import Unit
from app.models.unit_enrollment import UnitEnrollment


def create_programme(session) -> Programme:
    programme = Programme(id=uuid4(), name="Test Programme",start_date=datetime.now(), end_date=datetime.today() + timedelta(days=365))
    session.add(programme)
    session.commit()
    return programme

def create_unit(session, programme_id) -> Unit:
    unit_id = uuid4()
    unit = Unit(id=unit_id, name="Test Unit", description="Test description", unit_code="COMS20017", colour="abcdef", programme_id=programme_id,)
    session.add(unit)
    session.commit()
    return unit

def create_lecturers(session, unit_id) -> UnitEnrollment:
    user_id = str(uuid4())
    unit_enrollment = UnitEnrollment(unit_id=unit_id, user_id=user_id, type="lecturer")
    session.add(unit_enrollment)
    session.commit()
    return unit_enrollment

def create_students(session, unit_id) -> UnitEnrollment:
    user_id = str(uuid4())
    unit_enrollment = UnitEnrollment(unit_id=unit_id, user_id=user_id, type="student")
    session.add(unit_enrollment)
    session.commit()
    return unit_enrollment

def create_coursework(session, unit_id) -> Coursework:
    coursework_id = uuid4()
    coursework = Coursework(id=coursework_id, name="Test coursework", description="Test description", unit_id=unit_id, due_date=datetime.today() + timedelta(days=365), colour="abcdef")
    session.add(coursework)
    session.commit()
    return coursework


def valid_unit_payload(programme_id):
    return {
        "name":"Imperative and Functional Programming",
        "description":"Intro to coding",
        "unit_code":"COMS10015",
        "colour":"abcdef",
        "programme_id":programme_id
    }

def valid_update_payload(programme_id):
    return {
        "name":"Object Oriented Programming",
        "description":"Intro to coding",
        "unit_code":"COMS10015",
        "colour":"abcdef",
        "programme_id":programme_id 
    }

def incomplete_payload(programme_id):
    return {
        "name":"Imperative and Functional Programming",
        "description":"Intro to coding",
        "colour":"abcdef",
        "programme_id":programme_id
    }

def invalid_programme_id(programme_id):
    return {
        "name":"Imperative and Functional Programming",
        "description":"Intro to coding",
        "unit_code":"COMS10015",
        "colour":"abcdef",
        "programme_id": "bec07dbc-08aa-4b26-b1c7-aed9e13496cb"
    }


## Tests to create units
# Valid test
def test_create_valid_unit(client, session):
    programme = create_programme(session)
    payload = valid_unit_payload(str(programme.id))

    response = client.post("/units/create", json=payload)
    assert response.status_code == 201
    data = response.json()

    # response checks
    assert data["name"] == payload["name"]
    assert data["programme_id"] == payload["programme_id"]
    
    # Query the database and check if the object exists
    statement = select(Unit).where(Unit.name == data["name"])
    units = session.exec(statement).all()

    assert len(units) == 1
    assert units[0].id is not None    
    assert str(units[0].programme_id) == data["programme_id"]

# Invalid test
def test_invalid_unit_data(client, session):
    programme = create_programme(session)
    payload = incomplete_payload(str(programme.id))

    response = client.post("/units/create", json=payload)
    assert response.status_code == 422

# Create same unit twice
def test_create_same_unit_twice(client, session):
    programme = create_programme(session)
    payload = valid_unit_payload(str(programme.id))

    response1 = client.post("/units/create", json=payload)
    response2 = client.post("/units/create", json=payload)
    assert response2.status_code == 400
    # response2 = client.post("")

# Invalid programme id doesn't make a unit
def test_invalid_programme_id(client, session):
    programme = create_programme(session)
    payload = invalid_programme_id(str(programme.id))

    response = client.post("/units/create", json=payload)

    assert response.status_code == 400

## Tests to get unit details
# Tests to get unit with valid details
def test_get_valid_unit_details(client, session):
    programme = create_programme(session)
    unit = create_unit(session, programme.id)
    response = client.get("/units/" + str(unit.id))
    data = response.json()

    assert response.status_code == 200
    assert data["name"] == "Test Unit"
    assert data["unit_code"] == "COMS20017"
    assert data["programme_id"] == str(programme.id)

# Test to get unit with invalid details
def test_get_invalid_unit_details(client, session):
    invalid_unit_id = "bec07dbc-08aa-4b26-b1c7-aed9e13496cb"
    response = client.get("/units/"+invalid_unit_id)

    assert response.status_code == 404

# Tests to get units with dates
def test_get_unit_details_dates(client, session):
    programme = create_programme(session)
    unit = create_unit(session, programme.id)
    response = client.get("/units/" + str(unit.id)+"/with_dates")
    data = response.json()

    assert response.status_code == 200
    assert data["start_date"] == programme.start_date.isoformat()


# Tests to get the lecturers of the units
def test_get_unit_lecturers(client, session):
    programme = create_programme(session)
    unit = create_unit(session, programme.id)
    unit_enrollment = create_lecturers(session, unit.id)
    response = client.get("/units/"+str(unit.id)+"/lecturers/")
    data =  response.json()

    assert data["lecturers"] == [unit_enrollment.user_id]


# Tests to update units
def test_update_units(client, session):
    programme = create_programme(session)
    unit = create_unit(session, programme.id)
    update_payload = valid_update_payload(str(programme.id))
    response = client.put("/units/"+str(unit.id), json=update_payload)

    assert response.status_code == 200

    statement = select(Unit).where(Unit.id == unit.id)
    unit = session.exec(statement).first()

    assert unit.name == "Object Oriented Programming"


# Tests to delete units
def test_delete_unit(client, session):
    programme = create_programme(session)
    unit = create_unit(session, programme.id)
    response = client.delete("/units/"+str(unit.id))

    assert response.status_code == 200

    statement = select(Unit).where(Unit.id == unit.id)
    deleted_unit = session.exec(statement).first()

    assert  deleted_unit is None 

def test_delete_non_existent_unit(client, session):
    response = client.delete("/units/"+"bec07dbc-08aa-4b26-b1c7-aed9e13496cb")
    assert response.status_code == 404

# Tests to get units taken by a student 
def test_get_units_taken_by_student(client, session):
    programme = create_programme(session)
    unit = create_unit(session, programme.id)
    unit_enrollment = create_students(session, unit.id)
    response = client.get("/units/u/"+str(unit_enrollment.user_id))
    data =  response.json()

    assert data["units"][0]["id"] == str(unit.id)

# Tests to get courseworks from a unit
def test_get_courseworks_in_a_unit(client, session):
    programme = create_programme(session)
    unit = create_unit(session, programme.id)
    coursework = create_coursework(session, unit.id)
    response = client.get("/units/"+str(unit.id)+"/courseworks")
    data = response.json()

    assert data["courseworks"][0]["name"] == "Test coursework"

# Tests to get all units
def test_get_all_units(client, session):
    programme = create_programme(session)
    unit = create_unit(session, programme.id)

    response = client.get("/units/")
    data = response.json()

    assert data["units"][0]["id"] == str(unit.id)
