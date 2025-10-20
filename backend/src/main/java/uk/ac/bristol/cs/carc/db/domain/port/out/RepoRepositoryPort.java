package uk.ac.bristol.cs.carc.db.domain.port.out;

import uk.ac.bristol.cs.carc.db.domain.ids.RepoId;
import uk.ac.bristol.cs.carc.db.domain.ids.StudentId;

import java.util.Set;

public interface RepoRepositoryPort {
    Set<StudentId> findStudentByRepo(RepoId repoId);
    Set<RepoId> findRepoByStudent(StudentId studentId);
}
