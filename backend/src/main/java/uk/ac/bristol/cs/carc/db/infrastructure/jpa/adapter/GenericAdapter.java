package uk.ac.bristol.cs.carc.db.infrastructure.jpa.adapter;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.mapper.DomainEntityBaseMapper;

import java.util.Optional;
import java.util.function.Function;

/**
 * create, read, update, delete adapter for JPA entities.
 *
 * @param <D>  The domain model type.
 * @param <E>  The JPA entity type.
 * @param <Id> The type of the entity's identifier.
 * @param <M>  The mapper type.
 */
public class GenericAdapter<D, E, Id, M extends DomainEntityBaseMapper<D, E>> {
    private final JpaRepository<E, Id> repository;
    private final M mapper;

    public GenericAdapter(JpaRepository<E, Id> repository, M mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional
    public D create(D domain) {
        E entity = mapper.toEntity(domain);
        E savedEntity = repository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Transactional(readOnly = true)
    public Optional<D> findById(Id id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Transactional
    public void deleteById(Id id) {
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public boolean isIdExists(Id id) {
        return repository.existsById(id);
    }
}
