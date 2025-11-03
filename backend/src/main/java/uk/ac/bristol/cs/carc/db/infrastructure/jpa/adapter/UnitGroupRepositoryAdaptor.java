package uk.ac.bristol.cs.carc.db.infrastructure.jpa.adapter;

import uk.ac.bristol.cs.carc.db.domain.ids.UnitGroupId;
import uk.ac.bristol.cs.carc.db.domain.ids.UnitId;
import uk.ac.bristol.cs.carc.db.domain.model.UnitGroup;
import uk.ac.bristol.cs.carc.db.domain.port.out.UnitGroupRepositoryPort;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.UnitGroupEntity;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.mapper.UnitGroupMapper;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository.UnitGroupRepository;

import java.util.Optional;
import java.util.UUID;

public class UnitGroupRepositoryAdaptor implements UnitGroupRepositoryPort {
    private final UnitGroupRepository unitGroupRepository;
    private final GenericAdapter<UnitGroup, UnitGroupEntity, UUID> base;

    public UnitGroupRepositoryAdaptor(UnitGroupRepository unitGroupRepository, UnitGroupMapper mapper) {
        this.unitGroupRepository = unitGroupRepository;
        this.base = new GenericAdapter<>(unitGroupRepository, mapper);
    }

    @Override
    public void linkUnitGroupToUnit(UnitGroupId unitGroupId, UnitId unitId) {

    }

    @Override
    public void unlinkUnitGroupFromUnit(UnitGroupId unitGroupId, UnitId unitId) {

    }

    @Override
    public UnitGroup save(UnitGroup domain) {
        return base.create(domain);
    }

    @Override
    public Optional<UnitGroup> findById(UnitGroupId unitGroupId) {
        return base.findById(unitGroupId.getValue());
    }

    @Override
    public void deleteById(UnitGroupId unitGroupId) {
        base.deleteById(unitGroupId.getValue());
    }

    @Override
    public boolean isIdExists(UnitGroupId unitGroupId) {
        return base.isIdExists(unitGroupId.getValue());
    }
}
