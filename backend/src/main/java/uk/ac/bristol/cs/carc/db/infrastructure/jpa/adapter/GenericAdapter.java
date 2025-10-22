package uk.ac.bristol.cs.carc.db.infrastructure.jpa.adapter;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.mapper.DomainEntityBaseMapper;

import java.util.Optional;
import java.util.function.Function;

/**
 * basic create, read, update, delete adapter for JPA entities.
 * @see StudentRepositoryAdapter for the usecase
 *
 * @param <D>  The domain model type.
 * @param <E>  The JPA entity type.
 * @param <Id> The type of the entity's identifier.
 */
public class GenericAdapter<D, E, Id> {
    private final JpaRepository<E, Id> repository;
    private final DomainEntityBaseMapper<D, E> mapper;

    public GenericAdapter(JpaRepository<E, Id> repository, DomainEntityBaseMapper<D, E> mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    /**
     *
     * @param domain The domain class that about to persistence in database
     * @return linked domain with
     */
    @Transactional
    public D create(D domain) {
        E entity = mapper.toEntity(domain);
        E savedEntity = repository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    /**
     *
     * @param id
     * @return
     */
    @Transactional(readOnly = true)
    public Optional<D> findById(Id id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    /**
     *
     * @param id
     */
    @Transactional
    public void deleteById(Id id) {
        repository.deleteById(id);
    }

    /**
     *
     * @param id
     * @return
     */
    @Transactional(readOnly = true)
    public boolean isIdExists(Id id) {
        return repository.existsById(id);
    }
}
