package uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.Coursework;

import java.util.Set;
import java.util.UUID;

@Repository
public interface CourseworkRepository extends JpaRepository<Coursework, UUID> {
    Set<UUID> findRepoIdsByUnitId(UUID unitId);
}
