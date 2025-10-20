package uk.ac.bristol.cs.carc.db.domain.ids;

import uk.ac.bristol.cs.carc.db.domain.shared.Id;

import java.util.UUID;

public class CourseworkId extends Id<UUID> {
    public CourseworkId(UUID value) {
        super(value);
    }
}
