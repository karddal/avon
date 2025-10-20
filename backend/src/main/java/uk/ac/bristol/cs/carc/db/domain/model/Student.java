package uk.ac.bristol.cs.carc.db.domain.model;

import lombok.Getter;
import lombok.Setter;
import uk.ac.bristol.cs.carc.db.domain.ids.StudentId;
import uk.ac.bristol.cs.carc.db.domain.ids.UnitId;

import java.util.HashSet;
import java.util.Set;

public class Student {
    @Getter
    private final StudentId studentId;

    // highly cost to have hashset on both side of the relation, if not needed to use remove this(when there is no need to get units from student)
    @Getter
    private final Set<UnitId> units = new HashSet<>();

    @Getter
    @Setter
    private String emailDomain;

    @Getter
    @Setter
    private String username;

    @Getter
    @Setter
    private String password;

    @Getter
    @Setter
    private String firstName;

    @Getter
    @Setter
    private String lastName;

    /* the add remove maybe should be manage by unit
    public void addUnit(UnitId unitId) {
        this.units.add(unitId);
    }

    public void removeUnit(UnitId unitId) {
        this.units.remove(unitId);
    }
    */

    public Student(StudentId studentId, String emailDomain, String username, String password, String firstName, String lastName) {
        this.studentId = studentId;
        this.emailDomain = emailDomain;
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
    }
}
