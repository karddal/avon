package uk.ac.bristol.cs.carc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.ac.bristol.cs.carc.entity.Coursework;

import java.util.UUID;

@Repository
public interface CourseworkRepository extends JpaRepository<Coursework, UUID> {
}
