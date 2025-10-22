package uk.ac.bristol.cs.carc.db.domain.port.out;

import uk.ac.bristol.cs.carc.db.domain.ids.RepoId;
import uk.ac.bristol.cs.carc.db.domain.ids.StudentId;
import uk.ac.bristol.cs.carc.db.domain.model.Coursework;
import uk.ac.bristol.cs.carc.db.domain.model.Lecture;
import uk.ac.bristol.cs.carc.db.domain.model.Repo;
import uk.ac.bristol.cs.carc.db.domain.model.Student;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.RepoEntity;

import java.util.Set;

public interface RepoRepositoryPort extends BaseRepositoryPort<Repo, RepoId> {
    void linkRepoToCoursework(Lecture lecture, Coursework coursework);
    void unlinkCourseworkFromRepo(Lecture lecture, Coursework coursework);

    void linkStudentToRepo(Student student, RepoId repoId);
    void unlinkStudentFromRepo(Student student, RepoId repoId);

    Set<StudentId> findStudentByRepo(RepoId repoId);
}
