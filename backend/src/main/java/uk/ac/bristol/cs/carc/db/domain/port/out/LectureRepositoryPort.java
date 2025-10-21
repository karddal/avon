package uk.ac.bristol.cs.carc.db.domain.port.out;

import uk.ac.bristol.cs.carc.db.domain.ids.LectureId;
import uk.ac.bristol.cs.carc.db.domain.ids.UnitId;
import uk.ac.bristol.cs.carc.db.domain.model.Lecture;
import uk.ac.bristol.cs.carc.db.domain.shared.BaseRepositoryPort;

import java.util.Set;

public interface LectureRepositoryPort extends BaseRepositoryPort<Lecture, LectureId> {
    void linkLectureToUnit();
    void unlinkLectureFromUnit();

    // not sure the direction of this relationship
    Set<UnitId> findUnitsByLecture(LectureId lectureId);
    Set<LectureId> findLecturesByUnit(UnitId unitId);
}
