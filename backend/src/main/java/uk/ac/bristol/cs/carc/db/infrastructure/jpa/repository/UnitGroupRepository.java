package uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.UnitGroup;

import java.util.UUID;

public interface UnitGroupRepository extends JpaRepository<UnitGroup, UUID> {
}
