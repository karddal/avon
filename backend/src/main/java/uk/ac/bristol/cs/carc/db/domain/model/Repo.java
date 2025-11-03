package uk.ac.bristol.cs.carc.db.domain.model;

import lombok.Getter;
import lombok.Setter;
import uk.ac.bristol.cs.carc.db.domain.ids.CourseworkId;
import uk.ac.bristol.cs.carc.db.domain.ids.RepoId;
import uk.ac.bristol.cs.carc.db.domain.ids.StudentId;

import java.util.HashSet;
import java.util.Set;

public class Repo {
    @Getter
    private final RepoId repoId;

    @Getter
    private final Set<StudentId> students = new HashSet<>();

    @Getter
    @Setter
    private CourseworkId courseworkId;

    @Getter
    @Setter
    private String name;

    @Getter
    @Setter
    private String url;

    public void addStudent(StudentId studentId) {
        this.students.add(studentId);
    }

    public void removeStudent(StudentId studentId) {
        this.students.remove(studentId);
    }

    public Repo(RepoId repoId, CourseworkId courseworkId, String name, String url) {
        this.repoId = repoId;
        this.courseworkId = courseworkId;
        this.name = name;
        this.url = url;
    }
}
