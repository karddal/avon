package uk.ac.bristol.cs.carc.db.domain.ids;

import uk.ac.bristol.cs.carc.db.domain.shared.Id;

import java.util.UUID;

public class UnitId extends Id<UUID> {
    public UnitId(UUID value) {
        super(value);
    }
}
