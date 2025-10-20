package uk.ac.bristol.cs.carc.db.domain.port.out;

import uk.ac.bristol.cs.carc.db.domain.ids.LectureId;
import uk.ac.bristol.cs.carc.db.domain.ids.StudentId;
import uk.ac.bristol.cs.carc.db.domain.ids.UnitId;

import java.util.Set;

public interface StudentRepositoryPort {
    Set<UnitId> findUnitByStudent(StudentId studentId);
    Set<StudentId> findStudentsByUnit(UnitId unitId);
}
