package uk.ac.bristol.cs.carc.db.infrastructure.jpa.adapter;

import uk.ac.bristol.cs.carc.db.domain.ids.LectureId;
import uk.ac.bristol.cs.carc.db.domain.ids.UnitId;
import uk.ac.bristol.cs.carc.db.domain.model.Lecture;
import uk.ac.bristol.cs.carc.db.domain.port.out.LectureRepositoryPort;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository.LecturerRepository;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository.UnitGroupRepository;

import java.util.Optional;
import java.util.Set;

public class LectureRepositoryAdapter implements LectureRepositoryPort {
    private final LecturerRepository lecturerRepository;

    @Override
    public void linkLectureToUnit() {

    }

    @Override
    public void unlinkLectureFromUnit() {

    }

    @Override
    public Set<UnitId> findUnitsByLecture(LectureId lectureId) {
        return Set.of();
    }

    @Override
    public Set<LectureId> findLecturesByUnit(UnitId unitId) {
        return Set.of();
    }

    public LectureRepositoryAdapter(LecturerRepository lecturerRepository) {
        this.lecturerRepository = lecturerRepository;
    }

    @Override
    public Lecture save(Lecture domain) {
        return null;
    }

    @Override
    public Optional<Lecture> findById(LectureId lectureId) {
        return Optional.empty();
    }

    @Override
    public void deleteById(LectureId lectureId) {

    }

    @Override
    public boolean isIdExists(LectureId lectureId) {
        return false;
    }
}
