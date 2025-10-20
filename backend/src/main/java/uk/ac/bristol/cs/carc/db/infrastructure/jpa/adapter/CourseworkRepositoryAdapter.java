package uk.ac.bristol.cs.carc.db.infrastructure.jpa.adapter;

import uk.ac.bristol.cs.carc.db.domain.ids.CourseworkId;
import uk.ac.bristol.cs.carc.db.domain.ids.RepoId;
import uk.ac.bristol.cs.carc.db.domain.port.out.CourseworkRepositoryPort;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository.CourseworkRepository;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public class CourseworkRepositoryAdapter implements CourseworkRepositoryPort {
    private final CourseworkRepository courseworkRepository;

    @Override
    public Set<RepoId> findReposByCoursework(CourseworkId courseworkId) {
        Set<UUID> repoUUIDs = courseworkRepository.findRepoIdsByUnitId(courseworkId.getValue());
        return repoUUIDs.stream().map(RepoId :: new).collect(Collectors.toSet());
    }

    public CourseworkRepositoryAdapter(CourseworkRepository courseworkRepository) {
        this.courseworkRepository = courseworkRepository;
    }
}
