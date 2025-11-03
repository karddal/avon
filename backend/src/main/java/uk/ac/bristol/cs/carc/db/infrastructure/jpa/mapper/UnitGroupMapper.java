package uk.ac.bristol.cs.carc.db.infrastructure.jpa.mapper;

import org.mapstruct.Mapper;
import uk.ac.bristol.cs.carc.db.domain.model.UnitGroup;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.UnitGroupEntity;

@Mapper(componentModel = "spring")
public interface UnitGroupMapper extends DomainEntityBaseMapper<UnitGroup, UnitGroupEntity>{
}
