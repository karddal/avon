package uk.ac.bristol.cs.carc.db.domain.shared;

import java.util.Optional;

public interface BaseRepositoryPort<T, Id> {
    T save(T domain);
    Optional<T> findById(Id id);
    void deleteById(Id id);
    boolean isIdExists(Id id);
}
