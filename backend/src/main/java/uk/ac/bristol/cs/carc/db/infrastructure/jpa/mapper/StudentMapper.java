package uk.ac.bristol.cs.carc.db.infrastructure.jpa.mapper;

import org.mapstruct.Mapper;
import uk.ac.bristol.cs.carc.db.domain.model.Student;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.StudentEntity;

@Mapper(componentModel = "spring")
public interface StudentMapper extends DomainEntityBaseMapper<Student, StudentEntity> {
}
