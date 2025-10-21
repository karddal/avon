package uk.ac.bristol.cs.carc.db.domain.port.out;

import uk.ac.bristol.cs.carc.db.domain.ids.RepoId;
import uk.ac.bristol.cs.carc.db.domain.ids.StudentId;
import uk.ac.bristol.cs.carc.db.domain.shared.BaseRepositoryPort;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.RepoEntity;

import java.util.Set;

public interface RepoRepositoryPort extends BaseRepositoryPort<RepoEntity, RepoId> {
    Set<StudentId> findStudentByRepo(RepoId repoId);
    Set<RepoId> findRepoByStudent(StudentId studentId);
}
