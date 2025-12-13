# import uuid
# import pytest
# from pydantic import ValidationError
# from sqlmodel import SQLModel, create_engine, Session, select

# from app.models import unit_group
# from app.core.types import academicYear

# TEST_DATABASE_URL = "sqlite:///./test_users.db"
# engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})

# def get_session_override():
#     #use a test database session instead of the real one.
#     with Session(engine) as session:
#         yield session

# @pytest.fixture(scope="session", autouse=True)
# def create_db_and_tables():
#     #Create all tables before running tests and drop them after the test session.
#     SQLModel.metadata.create_all(engine)
#     yield
#     SQLModel.metadata.drop_all(engine)

# def test_academic_year_basic():
#     ay = academicYear.AcademicYear(2024)
#     assert ay.get_start_year() == 2024
#     assert ay.get_end_year() == 2025

# def test_unit_group_from_academic_year():
#     ay = academicYear.AcademicYear(2023)
#     ug = unit_group.UnitGroup.from_academic_year(name="Group A", ay=ay)
#     assert ug.name == "Group A"
#     assert ug.academic_year_start == 2023
#     assert ug.academic_year_end == 2024
#     assert isinstance(ug.id, uuid.UUID)

# def test_unit_group_end_autofill():
#     # cademic_year_end should be academic_year_start+1
#     ug = unit_group.UnitGroup(name="Group B", academic_year_start=2022, academic_year_end=None)
#     assert ug.academic_year_end == 2023

# def test_unit_group_end_must_equal_start_plus_one():
#     # if academic_year_end is wrong，should throw ValidationError
#     with pytest.raises(ValidationError):
#         unit_group.UnitGroup(name="Group C", academic_year_start=2022, academic_year_end=2025)

# def test_persist_and_read(engine):
#     with Session(engine) as session:
#         ug = unit_group.UnitGroup.from_academic_year("Physics B", academicYear.AcademicYear(2021))
#         session.add(ug)
#         session.commit()
#         session.refresh(ug)

#         stmt = select(unit_group.UnitGroup).where(unit_group.UnitGroup.name == "Physics B")
#         row = session.exec(stmt).first()

#         assert row is not None
#         assert row.academic_year_start == 2021
#         assert row.academic_year_end == 2022
#         # It should be restored to AcademicYear class
#         ay = row.get_academic_year()
#         assert ay.get_start_year() == 2021
#         assert ay.get_end_year() == 2022

# def test_unique_ids():
#     ug1 = unit_group.UnitGroup.from_academic_year("G1", academicYear.AcademicYear(2020))
#     ug2 = unit_group.UnitGroup.from_academic_year("G2", academicYear.AcademicYear(2020))
#     assert ug1.id != ug2.id