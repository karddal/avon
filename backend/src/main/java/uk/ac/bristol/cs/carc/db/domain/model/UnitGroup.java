package uk.ac.bristol.cs.carc.db.domain.model;

import lombok.Getter;
import lombok.Setter;
import uk.ac.bristol.cs.carc.db.domain.ids.UnitGroupId;
import uk.ac.bristol.cs.carc.db.domain.ids.UnitId;

public class UnitGroup {
    @Getter
    private final UnitGroupId unitGroupId;

    @Getter
    @Setter
    private UnitId unitId;

    public UnitGroup(UnitGroupId unitGroupId) {
        this.unitGroupId = unitGroupId;
    }
}
