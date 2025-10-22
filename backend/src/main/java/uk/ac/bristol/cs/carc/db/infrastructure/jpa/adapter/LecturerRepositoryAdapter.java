package uk.ac.bristol.cs.carc.db.infrastructure.jpa.adapter;

import uk.ac.bristol.cs.carc.db.domain.ids.LectureId;
import uk.ac.bristol.cs.carc.db.domain.ids.UnitId;
import uk.ac.bristol.cs.carc.db.domain.model.Lecture;
import uk.ac.bristol.cs.carc.db.domain.port.out.LecturerRepositoryPort;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.LecturerEntity;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.mapper.LecturerMapper;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository.LecturerRepository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public class LecturerRepositoryAdapter implements LecturerRepositoryPort {
    private final LecturerRepository lecturerRepository;
    private final GenericAdapter<Lecture, LecturerEntity, UUID> base;

    public LecturerRepositoryAdapter(LecturerRepository lecturerRepository, LecturerMapper mapper) {
        this.lecturerRepository = lecturerRepository;
        this.base = new GenericAdapter<>(this.lecturerRepository, mapper);
    }

    @Override
    public Set<UnitId> findUnitsByLecture(LectureId lectureId) {
        return Set.of();
    }

    @Override
    public Lecture save(Lecture domain) {
        return base.create(domain);
    }

    @Override
    public Optional<Lecture> findById(LectureId lectureId) {
        return base.findById(lectureId.getValue());
    }

    @Override
    public void deleteById(LectureId lectureId) {
        base.deleteById(lectureId.getValue());
    }

    @Override
    public boolean isIdExists(LectureId lectureId) {
        return base.isIdExists(lectureId.getValue());
    }
}
