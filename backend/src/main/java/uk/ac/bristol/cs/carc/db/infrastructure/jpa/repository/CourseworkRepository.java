package uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.CourseworkEntity;

import java.util.Set;
import java.util.UUID;

@Repository
public interface CourseworkRepository extends JpaRepository<CourseworkEntity, UUID> {
    Set<UUID> findRepoIdsByUnitId(UUID unitId);
}
