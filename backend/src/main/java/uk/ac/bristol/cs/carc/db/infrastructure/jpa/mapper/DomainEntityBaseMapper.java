package uk.ac.bristol.cs.carc.db.infrastructure.jpa.mapper;

public interface DomainEntityBaseMapper<D, E> {
    E toEntity(D domain);
    D toDomain(E entity);
}
