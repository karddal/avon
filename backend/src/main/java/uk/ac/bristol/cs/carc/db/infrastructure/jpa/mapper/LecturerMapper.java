package uk.ac.bristol.cs.carc.db.infrastructure.jpa.mapper;

import org.mapstruct.Mapper;
import uk.ac.bristol.cs.carc.db.domain.model.Lecture;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.LecturerEntity;

@Mapper(componentModel = "spring")
public interface LecturerMapper extends DomainEntityBaseMapper<Lecture, LecturerEntity> {
}
