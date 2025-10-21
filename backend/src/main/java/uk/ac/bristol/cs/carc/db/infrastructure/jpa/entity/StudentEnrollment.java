package uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table()
@Data
@AllArgsConstructor
public class StudentEnrollment {
    @Id
    @Column(columnDefinition = "uuid", nullable = false, updatable = false)
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private StudentEntity student;

    @ManyToOne
    @JoinColumn(name = "unit_id")
    private UnitEntity unit;

    public StudentEnrollment() {
    }
}
