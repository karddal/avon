package uk.ac.bristol.cs.carc.db.infrastructure.jpa.adapter;

import uk.ac.bristol.cs.carc.db.domain.ids.StudentId;
import uk.ac.bristol.cs.carc.db.domain.ids.UnitId;
import uk.ac.bristol.cs.carc.db.domain.model.Student;
import uk.ac.bristol.cs.carc.db.domain.port.out.StudentRepositoryPort;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.entity.StudentEntity;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.mapper.StudentMapper;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository.StudentRepository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public class StudentRepositoryAdapter implements StudentRepositoryPort {
    private final StudentRepository studentRepository;
    private final GenericAdapter<Student, StudentEntity, UUID> base;

    @Override
    public Set<UnitId> findUnitByStudent(StudentId studentId) {
        return Set.of();
    }

    public StudentRepositoryAdapter(StudentRepository studentRepository, StudentMapper mapper) {
        this.studentRepository = studentRepository;
        this.base = new GenericAdapter<>(this.studentRepository, mapper);
    }

    @Override
    public Student save(Student domain) {
        return base.create(domain);
    }

    @Override
    public Optional<Student> findById(StudentId studentId) {
        return base.findById(studentId.getValue());
    }

    @Override
    public void deleteById(StudentId studentId) {
        base.deleteById(studentId.getValue());
    }

    @Override
    public boolean isIdExists(StudentId studentId) {
        return base.isIdExists(studentId.getValue());
    }
}
