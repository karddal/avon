from datetime import date

from app.services import db_reset


def test_split_sql_statements_removes_comments_and_empty_statements():
    assert db_reset.split_sql_statements(
        """
        -- comment
        CREATE TABLE example(id int);

        INSERT INTO example VALUES (1);
        """
    ) == [
        "CREATE TABLE example(id int)",
        "INSERT INTO example VALUES (1)",
    ]


def test_academic_year_helpers_before_and_after_rollover():
    assert db_reset._current_academic_year_start(date(2026, 9, 9)) == 2025
    assert db_reset._current_academic_year_start(date(2026, 9, 10)) == 2026

    seed = {"study_year": 2, "academic_year_offset": -1}
    assert db_reset._programme_seed_years(seed, date(2026, 10, 1)) == (2025, 2026)
    assert (
        db_reset._programme_seed_name(seed, date(2026, 10, 1))
        == "Year 2 Computer Science 2025-2026"
    )
    assert db_reset._programme_seed_start_date(seed, date(2026, 10, 1)) == date(
        2025, 9, 10
    )
    assert db_reset._programme_seed_end_date(seed, date(2026, 10, 1)) == date(
        2026, 8, 31
    )


def test_seed_builders_create_related_objects():
    programmes = db_reset._build_programmes(date(2026, 10, 1))
    units = db_reset._build_units(programmes)
    enrollments = db_reset._build_unit_enrollments(
        units,
        student_ids=["student-1", "student-2"],
        lecturer_ids=["lecturer-1"],
    )
    courseworks = db_reset._build_courseworks(units)

    assert len(programmes) == len(db_reset.PROGRAMME_SEEDS)
    assert len(units) == len(db_reset.UNIT_SEEDS)
    assert len(enrollments) == len(units) * 3
    assert len(courseworks) == len(db_reset.COURSEWORK_SEEDS)
    assert all(coursework.gitlab_id == db_reset.GITLAB_ID_DEFAULT for coursework in courseworks)
