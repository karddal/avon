class AcademicYear:
    def __init__(self, start_year: int):
        self.startYear = start_year
        self.endYear = start_year + 1

    def get_start_year(self) -> int:
        return self.startYear

    def get_end_year(self) -> int:
        return self.endYear
