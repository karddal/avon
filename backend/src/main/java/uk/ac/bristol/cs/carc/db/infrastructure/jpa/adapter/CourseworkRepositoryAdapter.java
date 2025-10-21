package uk.ac.bristol.cs.carc.db.infrastructure.jpa.adapter;

import uk.ac.bristol.cs.carc.db.domain.ids.CourseworkId;
import uk.ac.bristol.cs.carc.db.domain.ids.RepoId;
import uk.ac.bristol.cs.carc.db.domain.model.Coursework;
import uk.ac.bristol.cs.carc.db.domain.port.out.CourseworkRepositoryPort;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.CourseworkEntity;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.mapper.CourseworkMapper;
import uk.ac.bristol.cs.carc.db.util.IdConverter;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository.CourseworkRepository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public class CourseworkRepositoryAdapter implements CourseworkRepositoryPort {
    private final CourseworkRepository courseworkRepository;
    private final GenericAdapter<Coursework, CourseworkEntity, UUID, CourseworkMapper> base;

    @Override
    public Set<RepoId> findReposByCoursework(CourseworkId courseworkId) {
        Set<UUID> repoUUIDs = courseworkRepository.findRepoIdsByUnitId(courseworkId.getValue());
        return IdConverter.toDomainSet(repoUUIDs, RepoId::new);
    }

    public CourseworkRepositoryAdapter(CourseworkRepository courseworkRepository, CourseworkMapper courseworkMapper) {
        this.courseworkRepository = courseworkRepository;
        this.base = new GenericAdapter<>(courseworkRepository, courseworkMapper);
    }

    @Override
    public Coursework save(Coursework domain) {
        return base.create(domain);
    }

    @Override
    public Optional<Coursework> findById(CourseworkId courseworkId) {
        return base.findById(courseworkId.getValue());
    }

    @Override
    public void deleteById(CourseworkId courseworkId) {
        base.deleteById(courseworkId.getValue());
    }

    @Override
    public boolean isIdExists(CourseworkId courseworkId) {
        return base.isIdExists(courseworkId.getValue());
    }
}
