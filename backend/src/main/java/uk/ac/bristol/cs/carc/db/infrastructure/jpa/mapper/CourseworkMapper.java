package uk.ac.bristol.cs.carc.db.infrastructure.jpa.mapper;

import org.mapstruct.Mapper;
import uk.ac.bristol.cs.carc.db.domain.model.Coursework;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.CourseworkEntity;

@Mapper(componentModel = "spring")
public interface CourseworkMapper extends DomainEntityBaseMapper<Coursework, CourseworkEntity> {
}
