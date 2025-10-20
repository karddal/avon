package uk.ac.bristol.cs.carc.db.domain.port.out;

import uk.ac.bristol.cs.carc.db.domain.ids.CourseworkId;
import uk.ac.bristol.cs.carc.db.domain.ids.RepoId;

import java.util.Set;

public interface CourseworkRepositoryPort {
    Set<RepoId> findReposByCoursework(CourseworkId courseworkId);
}
