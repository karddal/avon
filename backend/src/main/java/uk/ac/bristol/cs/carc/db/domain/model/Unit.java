package uk.ac.bristol.cs.carc.db.domain.model;

import lombok.Getter;
import lombok.Setter;
import uk.ac.bristol.cs.carc.db.domain.ids.*;

import java.util.HashSet;
import java.util.Set;

public class Unit {
    @Getter
    private final UnitId id;

    @Getter
    private final Set<LectureId> lectures = new HashSet<>();

    @Getter
    private final Set<StudentId> students = new HashSet<>();

    @Getter
    private final Set<CourseworkId> coursework = new HashSet<>();

    @Getter
    private final Set<UnitGroupId> groups = new HashSet<>();

    @Getter
    @Setter
    private String title;

    @Getter
    @Setter
    private String unitCode;

    @Getter
    @Setter
    private String description;

    public void addLecture(LectureId lectureId) {
        lectures.add(lectureId);
    }

    public void addStudent(StudentId studentId) {
        students.add(studentId);
    }

    public void addCoursework(CourseworkId courseworkId) {
        coursework.add(courseworkId);
    }

    public void addGroup(UnitGroupId unitGroupId) {
        groups.add(unitGroupId);
    }

    public void removeLecture(LectureId lectureId) {
        lectures.remove(lectureId);
    }

    public void removeStudent(StudentId studentId) {
        students.remove(studentId);
    }

    public void removeCoursework(CourseworkId courseworkId) {
        coursework.remove(courseworkId);
    }

    public void removeGroup(UnitGroupId unitGroupId) {
        groups.remove(unitGroupId);
    }

    public Unit(UnitId id, String title, String unitCode, String description) {
        this.id = id;
        this.title = title;
        this.unitCode = unitCode;
        this.description = description;
    }
}

