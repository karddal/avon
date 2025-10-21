package uk.ac.bristol.cs.carc.db.domain.port.out;

import uk.ac.bristol.cs.carc.db.domain.ids.CourseworkId;
import uk.ac.bristol.cs.carc.db.domain.ids.RepoId;
import uk.ac.bristol.cs.carc.db.domain.model.Coursework;
import uk.ac.bristol.cs.carc.db.domain.shared.BaseRepositoryPort;

import java.util.Set;

public interface CourseworkRepositoryPort extends BaseRepositoryPort<Coursework, CourseworkId> {
    Set<RepoId> findReposByCoursework(CourseworkId courseworkId);
}
