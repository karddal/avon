package uk.ac.bristol.cs.carc.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "unit")
public class Unit {
    @Id
    @Column(columnDefinition = "uuid", nullable = false, updatable = false)
    @GeneratedValue
        @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL,  orphanRemoval = true)
    private Set<LecturerEnrollment> lecturerEnrollments = new HashSet<>();

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL,  orphanRemoval = true)
    private Set<StudentEnrollment> studentEnrollments = new HashSet<>();

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL,  orphanRemoval = true)
    private Set<Coursework> coursework = new HashSet<>();

    @Column(nullable = false)
    private String unitCode;

    @Column(nullable = false)
    private String unitName;

    private String description;
}
