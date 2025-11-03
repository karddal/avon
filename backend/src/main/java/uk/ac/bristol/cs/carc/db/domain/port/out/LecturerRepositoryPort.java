package uk.ac.bristol.cs.carc.db.domain.port.out;

import uk.ac.bristol.cs.carc.db.domain.ids.LectureId;
import uk.ac.bristol.cs.carc.db.domain.ids.UnitId;
import uk.ac.bristol.cs.carc.db.domain.model.Lecture;

import java.util.Set;

public interface LecturerRepositoryPort extends BaseRepositoryPort<Lecture, LectureId> {
    Set<UnitId> findUnitsByLecture(LectureId lectureId);
}
