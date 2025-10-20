package uk.ac.bristol.cs.carc.db.domain.ids;

import uk.ac.bristol.cs.carc.db.domain.shared.Id;

import java.util.UUID;

public class LectureId extends Id<UUID> {
    public LectureId(UUID value) {
        super(value);
    }
}
