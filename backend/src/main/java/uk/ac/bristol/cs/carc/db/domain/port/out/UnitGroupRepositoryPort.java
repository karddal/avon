package uk.ac.bristol.cs.carc.db.domain.port.out;

import uk.ac.bristol.cs.carc.db.domain.ids.UnitGroupId;
import uk.ac.bristol.cs.carc.db.domain.ids.UnitId;
import uk.ac.bristol.cs.carc.db.domain.model.UnitGroup;

import java.util.Set;

public interface UnitGroupRepositoryPort extends BaseRepositoryPort<UnitGroup, UnitGroupId> {
    void linkUnitGroupToUnit(UnitGroupId unitGroupId, UnitId unitId);
    void unlinkUnitGroupFromUnit(UnitGroupId unitGroupId, UnitId unitId);
}
