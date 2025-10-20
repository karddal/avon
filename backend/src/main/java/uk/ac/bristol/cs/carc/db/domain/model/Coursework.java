package uk.ac.bristol.cs.carc.db.domain.model;

import lombok.Getter;
import lombok.Setter;
import uk.ac.bristol.cs.carc.db.domain.ids.CourseworkId;
import uk.ac.bristol.cs.carc.db.domain.ids.RepoId;
import uk.ac.bristol.cs.carc.db.domain.ids.UnitId;

import java.util.HashSet;
import java.util.Set;

public class Coursework {
    @Getter
    private final CourseworkId courseworkId;

    @Getter
    private final Set<RepoId> repos = new HashSet<>();

    @Getter
    @Setter
    private UnitId unitId;

    @Getter
    @Setter
    private String title;

    @Getter
    @Setter
    private String description;

    public void addRepo(RepoId repoId) {
        this.repos.add(repoId);
    }

    public void removeRepo(RepoId repoId) {
        this.repos.remove(repoId);
    }

    public Coursework(CourseworkId courseworkId, UnitId unitId, String title, String description) {
        this.courseworkId = courseworkId;
        this.unitId = unitId;
        this.title = title;
        this.description = description;
    }
}
