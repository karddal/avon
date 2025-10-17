package uk.ac.bristol.cs.carc.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "lecturer")
public class Lecturer {
    @Id
    @Column(columnDefinition = "uuid", nullable = false, updatable = false)
    @GeneratedValue
        @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    //tbd
    @OneToMany(mappedBy = "lecturer", cascade = CascadeType.ALL,  orphanRemoval = true)
    private Set<LecturerEnrollment> lecturerEnrollments = new HashSet<>();

    @Column(nullable = false)
    private String emailDomain;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;
}
