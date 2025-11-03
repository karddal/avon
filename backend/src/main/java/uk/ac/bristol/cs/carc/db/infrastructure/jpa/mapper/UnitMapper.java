package uk.ac.bristol.cs.carc.db.infrastructure.jpa.mapper;

import org.mapstruct.Mapper;
import uk.ac.bristol.cs.carc.db.domain.model.Unit;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.UnitEntity;

@Mapper(componentModel = "spring")
public interface UnitMapper extends DomainEntityBaseMapper<Unit, UnitEntity>{
}
