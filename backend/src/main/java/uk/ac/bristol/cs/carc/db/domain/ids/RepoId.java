package uk.ac.bristol.cs.carc.db.domain.ids;

import uk.ac.bristol.cs.carc.db.domain.shared.Id;

import java.util.UUID;

public class RepoId extends Id<UUID> {
    public RepoId(UUID value) {
        super(value);
    }
}
