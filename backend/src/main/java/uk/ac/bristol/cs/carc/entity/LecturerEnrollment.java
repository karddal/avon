package uk.ac.bristol.cs.carc.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table()
//TODO: maybe class name need some change to clarify the linking table
//TODO: I will add java doc before merge to the dev branch
//TODO: generate the database using flyway
//TODO: improve the structure of data base, turing the strategy of database
//TODO: finish basic api of database
//TODO: testing
public class LecturerEnrollment {
    @Id
    @Column(columnDefinition = "uuid", nullable = false, updatable = false)
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "lecturer_id")
    private Lecturer lecturer;

    @ManyToOne
    @JoinColumn(name = "unit_id")
    private Unit unit;
}
