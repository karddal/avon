package uk.ac.bristol.cs.carc.db.infrastructure.jpa.adapter;

import uk.ac.bristol.cs.carc.db.domain.port.out.UnitGroupRepositoryPort;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository.UnitGroupRepository;

public class UnitGroupRepositoryAdaptor implements UnitGroupRepositoryPort {
    private final UnitGroupRepository unitGroupRepository;

    public UnitGroupRepositoryAdaptor(UnitGroupRepository unitGroupRepository) {
        this.unitGroupRepository = unitGroupRepository;
    }
}
