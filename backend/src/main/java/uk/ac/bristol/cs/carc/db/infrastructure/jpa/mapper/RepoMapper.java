package uk.ac.bristol.cs.carc.db.infrastructure.jpa.mapper;

import org.mapstruct.Mapper;
import uk.ac.bristol.cs.carc.db.domain.model.Repo;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.RepoEntity;

@Mapper(componentModel = "spring")
public interface RepoMapper extends DomainEntityBaseMapper<Repo, RepoEntity>{
}
