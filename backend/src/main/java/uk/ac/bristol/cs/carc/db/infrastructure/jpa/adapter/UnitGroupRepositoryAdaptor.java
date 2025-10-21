package uk.ac.bristol.cs.carc.db.infrastructure.jpa.adapter;

import uk.ac.bristol.cs.carc.db.domain.ids.UnitGroupId;
import uk.ac.bristol.cs.carc.db.domain.port.out.UnitGroupRepositoryPort;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.UnitGroupEntity;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository.UnitGroupRepository;

import java.util.Optional;

public class UnitGroupRepositoryAdaptor implements UnitGroupRepositoryPort {
    private final UnitGroupRepository unitGroupRepository;

    public UnitGroupRepositoryAdaptor(UnitGroupRepository unitGroupRepository) {
        this.unitGroupRepository = unitGroupRepository;
    }

    @Override
    public UnitGroupEntity save(UnitGroupEntity domain) {
        return null;
    }

    @Override
    public Optional<UnitGroupEntity> findById(UnitGroupId unitGroupId) {
        return Optional.empty();
    }

    @Override
    public void deleteById(UnitGroupId unitGroupId) {

    }

    @Override
    public boolean isIdExists(UnitGroupId unitGroupId) {
        return false;
    }
}
