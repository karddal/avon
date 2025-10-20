package uk.ac.bristol.cs.carc.db.domain.ids;

import uk.ac.bristol.cs.carc.db.domain.shared.Id;

import java.util.UUID;

public class UnitGroupId extends Id<UUID> {
    public UnitGroupId(UUID value) {
        super(value);
    }
}
