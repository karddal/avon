package uk.ac.bristol.cs.carc.user.application.domain.model;

import java.util.Optional;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

/*
An abstract user of the system.
 */
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class User {

    /*
    The unique ID representing the user in the system.
     */
    private final UserId id;

    /*
    The first name of the user.
     */
    @Getter private final String firstName;

    /*
    The last name of the user.
     */
    @Getter private final String lastName;

    public Optional<UserId> getId() {
        return Optional.ofNullable(this.id);
    }

    public record UserId(java.util.UUID value) {}
}
