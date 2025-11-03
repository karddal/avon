package uk.ac.bristol.cs.carc.db.domain.ids;

import uk.ac.bristol.cs.carc.db.domain.shared.Id;

import java.util.UUID;

public class StudentId extends Id<UUID> {
    public StudentId(UUID value) {
        super(value);
    }
}
