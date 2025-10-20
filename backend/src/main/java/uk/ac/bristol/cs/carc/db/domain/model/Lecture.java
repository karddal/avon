package uk.ac.bristol.cs.carc.db.domain.model;

import lombok.Getter;
import lombok.Setter;
import uk.ac.bristol.cs.carc.db.domain.ids.LectureId;
import uk.ac.bristol.cs.carc.db.domain.ids.UnitId;

import java.util.HashSet;
import java.util.Set;

public class Lecture {
    @Getter
    private final LectureId lectureId;

    // highly cost to have hashset on both side of the relation, if not needed to use remove this(when there is no need to get units from lecture)
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

    //this probably is right, because the lecture should be able to add or remove units they teach
    public void addUnit(UnitId unitId) {
        this.units.add(unitId);
    }

    public void removeUnit(UnitId unitId) {
        this.units.remove(unitId);
    }

    public Lecture(LectureId lectureId, String emailDomain, String username, String password, String firstName, String lastName) {
        this.lectureId = lectureId;
        this.emailDomain = emailDomain;
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
    }
}
