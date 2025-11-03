package uk.ac.bristol.cs.carc.db.infrastructure.jpa.adapter;

import uk.ac.bristol.cs.carc.db.domain.ids.RepoId;
import uk.ac.bristol.cs.carc.db.domain.ids.StudentId;
import uk.ac.bristol.cs.carc.db.domain.model.Coursework;
import uk.ac.bristol.cs.carc.db.domain.model.Lecture;
import uk.ac.bristol.cs.carc.db.domain.model.Repo;
import uk.ac.bristol.cs.carc.db.domain.model.Student;
import uk.ac.bristol.cs.carc.db.domain.port.out.RepoRepositoryPort;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.RepoEntity;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.mapper.RepoMapper;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository.RepoRepository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public class RepoRepositoryAdapter implements RepoRepositoryPort {
    private final RepoRepository repoRepository;
    private final GenericAdapter<Repo, RepoEntity, UUID> base;

    public RepoRepositoryAdapter(RepoRepository repoRepository, RepoMapper mapper) {
        this.repoRepository = repoRepository;
        this.base = new GenericAdapter<>(repoRepository, mapper);
    }

    @Override
    public void linkRepoToCoursework(Lecture lecture, Coursework coursework) {

    }

    @Override
    public void unlinkCourseworkFromRepo(Lecture lecture, Coursework coursework) {

    }

    @Override
    public void linkStudentToRepo(Student student, RepoId repoId) {

    }

    @Override
    public void unlinkStudentFromRepo(Student student, RepoId repoId) {

    }

    @Override
    public Set<StudentId> findStudentByRepo(RepoId repoId) {
        return Set.of();
    }

    @Override
    public Repo save(Repo domain) {
        return base.create(domain);
    }

    @Override
    public Optional<Repo> findById(RepoId repoId) {
        return base.findById(repoId.getValue());
    }

    @Override
    public void deleteById(RepoId repoId) {
        base.deleteById(repoId.getValue());
    }

    @Override
    public boolean isIdExists(RepoId repoId) {
        return base.isIdExists(repoId.getValue());
    }
}
