package uk.ac.bristol.cs.carc.db.domain.port.out;

import uk.ac.bristol.cs.carc.db.domain.ids.StudentId;
import uk.ac.bristol.cs.carc.db.domain.ids.UnitId;
import uk.ac.bristol.cs.carc.db.domain.model.Student;

import java.util.Set;

public interface StudentRepositoryPort extends BaseRepositoryPort<Student, StudentId> {
    Set<UnitId> findUnitByStudent(StudentId studentId);
}
