package uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "coursework")
@Data
@AllArgsConstructor
public class CourseworkEntity {
    @Id
    @Column(columnDefinition = "uuid", nullable = false, updatable = false)
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.TIME)
    private UUID id;

    @OneToMany(mappedBy = "coursework", cascade = CascadeType.ALL,  orphanRemoval = true)
    private Set<RepoEntity> repos = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "unit_id")
    private UnitEntity unit;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    public CourseworkEntity() {
    }
}
