package uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "student")
@Data
@AllArgsConstructor
public class Student {
    @Id
    @Column(columnDefinition = "uuid", nullable = false, updatable = false)
    @GeneratedValue
        @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL,  orphanRemoval = true)
    private Set<StudentEnrollment> studentEnrollments = new HashSet<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL,  orphanRemoval = true)
    private Set<RepoOwner> repoOwners = new HashSet<>();

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

    public Student() {
    }
}
