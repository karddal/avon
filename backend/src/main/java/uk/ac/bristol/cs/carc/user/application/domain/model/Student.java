package uk.ac.bristol.cs.carc.user.application.domain.model;

import org.jmolecules.ddd.annotation.Entity;

@Entity
public class Student extends User {

    private Student(UserId id, String firstName, String lastName) {
        super(id, firstName, lastName);
    }

    public static Student withoutId(String firstName, String lastName) {
        return new Student(null, firstName, lastName);
    }

    public static Student withId(UserId id, String firstName, String lastName) {
        return new Student(id, firstName, lastName);
    }
}
