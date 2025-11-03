package uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "repo")
@Data
@AllArgsConstructor
public class RepoEntity {
    @Id
    @Column(columnDefinition = "uuid", nullable = false, updatable = false)
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @OneToMany(mappedBy = "repo", cascade = CascadeType.ALL,  orphanRemoval = true)
    private Set<RepoOwnerEntity> repoOwners = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "coursework_id")
    private CourseworkEntity coursework;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String url;

    public RepoEntity() {
    }
}
