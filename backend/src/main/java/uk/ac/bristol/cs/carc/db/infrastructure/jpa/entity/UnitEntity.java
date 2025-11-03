package uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "unit")
@Data
@AllArgsConstructor
public class UnitEntity {
    @Id
    @Column(columnDefinition = "uuid", nullable = false, updatable = false)
    @GeneratedValue
        @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL,  orphanRemoval = true)
    private Set<LecturerEnrollmentEntity> lecturerEnrollments = new HashSet<>();

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL,  orphanRemoval = true)
    private Set<StudentEnrollment> studentEnrollments = new HashSet<>();

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL,  orphanRemoval = true)
    private Set<CourseworkEntity> coursework = new HashSet<>();

    @OneToMany(mappedBy = "unit_group", cascade = CascadeType.ALL,  orphanRemoval = true)
    private Set<UnitGroupEntity> unitGroups = new HashSet<>();

    @Column(nullable = false)
    private String unitCode;

    @Column(nullable = false)
    private String title;

    private String description;

    public UnitEntity() {
    }
}
