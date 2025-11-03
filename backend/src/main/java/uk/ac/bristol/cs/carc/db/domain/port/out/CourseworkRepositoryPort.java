package uk.ac.bristol.cs.carc.db.domain.port.out;

import uk.ac.bristol.cs.carc.db.domain.ids.*;
import uk.ac.bristol.cs.carc.db.domain.model.Coursework;

import java.util.Set;

public interface CourseworkRepositoryPort extends BaseRepositoryPort<Coursework, CourseworkId> {
    void linkCourseworkToUnit(UnitId unitId, CourseworkId courseworkId);
    void unlinkCourseworkFromUnit(UnitId unitId, CourseworkId courseworkId);

    Set<RepoId> findReposByCoursework(CourseworkId courseworkId);
}
