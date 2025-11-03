package uk.ac.bristol.cs.carc.db.domain.port.out;

import uk.ac.bristol.cs.carc.db.domain.ids.*;
import uk.ac.bristol.cs.carc.db.domain.model.Unit;

import java.util.Set;

public interface UnitRepositoryPort extends BaseRepositoryPort<Unit, UnitId> {
    void linkStudentToUnit(StudentId studentId, UnitId unitId);
    void unlinkStudentFromUnit(StudentId studentId, UnitId unitId);

    void linkLectureToUnit(LectureId lectureId, UnitId unitId);
    void unlinkLectureFromUnit(LectureId lectureId, UnitId unitId);

    Set<LectureId> findLecturesByUnit(UnitId unitId);
    Set<StudentId> findStudentsByUnit(UnitId unitId);

    Set<CourseworkId> findCourseworkByUnit(UnitId unitId);
    Set<UnitGroupId> findUnitGroupsByUnit(UnitId unitId);
}
