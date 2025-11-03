package uk.ac.bristol.cs.carc.db.infrastructure.jpa.adapter;

import uk.ac.bristol.cs.carc.db.domain.ids.*;
import uk.ac.bristol.cs.carc.db.domain.model.Unit;
import uk.ac.bristol.cs.carc.db.domain.port.out.UnitRepositoryPort;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.UnitEntity;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.mapper.UnitMapper;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository.UnitRepository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public class UnitRepositoryAdapter implements UnitRepositoryPort {
    private final UnitRepository unitRepository;
    private final GenericAdapter<Unit, UnitEntity, UUID> base;

    public UnitRepositoryAdapter(UnitRepository unitRepository, UnitMapper mapper) {
        this.unitRepository = unitRepository;
        this.base = new GenericAdapter<>(unitRepository, mapper);
    }

    @Override
    public void linkStudentToUnit(StudentId studentId, UnitId unitId) {

    }

    @Override
    public void unlinkStudentFromUnit(StudentId studentId, UnitId unitId) {

    }

    @Override
    public void linkLectureToUnit(LectureId lectureId, UnitId unitId) {

    }

    @Override
    public void unlinkLectureFromUnit(LectureId lectureId, UnitId unitId) {

    }

    @Override
    public Set<LectureId> findLecturesByUnit(UnitId unitId) {
        return Set.of();
    }

    @Override
    public Set<StudentId> findStudentsByUnit(UnitId unitId) {
        return Set.of();
    }

    @Override
    public Set<CourseworkId> findCourseworkByUnit(UnitId unitId) {
        return Set.of();
    }

    @Override
    public Set<UnitGroupId> findUnitGroupsByUnit(UnitId unitId) {
        return Set.of();
    }

    @Override
    public Unit save(Unit domain) {
        return base.create(domain);
    }

    @Override
    public Optional<Unit> findById(UnitId unitId) {
        return base.findById(unitId.getValue());
    }

    @Override
    public void deleteById(UnitId unitId) {
        base.deleteById(unitId.getValue());
    }

    @Override
    public boolean isIdExists(UnitId unitId) {
        return base.isIdExists(unitId.getValue());
    }
}
