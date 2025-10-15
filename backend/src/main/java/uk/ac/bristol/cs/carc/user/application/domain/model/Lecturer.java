package uk.ac.bristol.cs.carc.user.application.domain.model;

import org.jmolecules.ddd.annotation.Entity;
import uk.ac.bristol.cs.carc.user.application.domain.model.User.UserId;

@Entity
public class Lecturer extends User {
    private Lecturer(UserId id, String firstName, String lastName) {
        super(id, firstName, lastName);
    }

    public static Lecturer withoutId(String firstName, String lastName) {
        return new Lecturer(null, firstName, lastName);
    }

    public static Lecturer withId(UserId id, String firstName, String lastName) {
        return new Lecturer(id, firstName, lastName);
    }
}
