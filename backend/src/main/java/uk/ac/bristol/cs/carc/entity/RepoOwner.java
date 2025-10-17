package uk.ac.bristol.cs.carc.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table()
public class RepoOwner {
    @Id
    @Column(columnDefinition = "uuid", nullable = false, updatable = false)
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "repo_id")
    private Repo repo;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;
}
