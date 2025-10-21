package uk.ac.bristol.cs.carc.db.infrastructure.jpa.adapter;

import uk.ac.bristol.cs.carc.db.domain.ids.RepoId;
import uk.ac.bristol.cs.carc.db.domain.ids.StudentId;
import uk.ac.bristol.cs.carc.db.domain.port.out.RepoRepositoryPort;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.RepoEntity;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository.RepoRepository;

import java.util.Optional;
import java.util.Set;

public class RepoRepositoryAdapter implements RepoRepositoryPort {
    private final RepoRepository repoRepository;

    @Override
    public Set<StudentId> findStudentByRepo(RepoId repoId) {
        return Set.of();
    }

    @Override
    public Set<RepoId> findRepoByStudent(StudentId studentId) {
        return Set.of();
    }

    public RepoRepositoryAdapter(RepoRepository repoRepository) {
        this.repoRepository = repoRepository;
    }

    @Override
    public RepoEntity save(RepoEntity domain) {
        return null;
    }

    @Override
    public Optional<RepoEntity> findById(RepoId repoId) {
        return Optional.empty();
    }

    @Override
    public void deleteById(RepoId repoId) {

    }

    @Override
    public boolean isIdExists(RepoId repoId) {
        return false;
    }
}
