package uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.LecturerEntity;

import java.util.UUID;

@Repository
public interface LecturerRepository extends JpaRepository<LecturerEntity, UUID> {
    LecturerEntity findByUsername(String username);
}
