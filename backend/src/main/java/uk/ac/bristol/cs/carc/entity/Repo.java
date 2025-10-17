package uk.ac.bristol.cs.carc.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "repo")
public class Repo {
    @Id
    @Column(columnDefinition = "uuid", nullable = false, updatable = false)
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @OneToMany(mappedBy = "repo", cascade = CascadeType.ALL,  orphanRemoval = true)
    private Set<RepoOwner> repoOwners = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "coursework_id")
    private Coursework coursework;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String link;
}
