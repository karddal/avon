package uk.ac.bristol.cs.carc.db.domain.port.out;

import uk.ac.bristol.cs.carc.db.domain.ids.*;
import uk.ac.bristol.cs.carc.db.domain.model.Unit;
import uk.ac.bristol.cs.carc.db.domain.shared.BaseRepositoryPort;

import java.util.Set;

public interface UnitRepositoryPort extends BaseRepositoryPort<Unit, UnitId> {
    Set<LectureId> findLectureIdsByUnit(UnitId unitId);
    Set<StudentId> findStudentIdsByUnit(UnitId unitId);
    Set<CourseworkId> findCourseworkIdsByUnit(UnitId unitId);
    Set<UnitGroupId> findUnitGroupIdsByUnit(UnitId unitId);
}
