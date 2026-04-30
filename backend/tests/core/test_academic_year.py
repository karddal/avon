from app.core.types.academicYear import AcademicYear


def test_academic_year_sets_end_year_from_start_year():
    academic_year = AcademicYear(2026)

    assert academic_year.get_start_year() == 2026
    assert academic_year.get_end_year() == 2027
