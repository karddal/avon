package uk.ac.bristol.cs.carc.db.infrastructure.jpa.adapter;

import uk.ac.bristol.cs.carc.db.domain.ids.*;
import uk.ac.bristol.cs.carc.db.domain.port.out.UnitRepositoryPort;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository.UnitRepository;

import java.util.Set;

public class UnitRepositoryAdapter implements UnitRepositoryPort {
    private final UnitRepository unitRepository;

    @Override
    public Set<LectureId> findLectureIdsByUnit(UnitId unitId) {
        return Set.of();
    }

    @Override
    public Set<StudentId> findStudentIdsByUnit(UnitId unitId) {
        return Set.of();
    }

    @Override
    public Set<CourseworkId> findCourseworkIdsByUnit(UnitId unitId) {
        return Set.of();
    }

    @Override
    public Set<UnitGroupId> findUnitGroupIdsByUnit(UnitId unitId) {
        return Set.of();
    }

    public UnitRepositoryAdapter(UnitRepository unitRepository) {
        this.unitRepository = unitRepository;
    }
}
