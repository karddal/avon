package uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.UnitEntity;

import java.util.UUID;

@Repository
public interface UnitRepository extends JpaRepository<UnitEntity, UUID> {
}
