package uk.ac.bristol.cs.carc.db.infrastructure.jpa.adapter;

import uk.ac.bristol.cs.carc.db.domain.ids.StudentId;
import uk.ac.bristol.cs.carc.db.domain.ids.UnitId;
import uk.ac.bristol.cs.carc.db.domain.model.Student;
import uk.ac.bristol.cs.carc.db.domain.port.out.StudentRepositoryPort;
import uk.ac.bristol.cs.carc.db.infrastructure.jpa.repository.StudentRepository;

import java.util.Optional;
import java.util.Set;

public class StudentRepositoryAdapter implements StudentRepositoryPort {
    private final StudentRepository studentRepository;

    @Override
    public Set<UnitId> findUnitByStudent(StudentId studentId) {
        return Set.of();
    }

    @Override
    public Set<StudentId> findStudentsByUnit(UnitId unitId) {
        return Set.of();
    }

    public StudentRepositoryAdapter(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public Student save(Student domain) {
        return null;
    }

    @Override
    public Optional<Student> findById(StudentId studentId) {
        return Optional.empty();
    }

    @Override
    public void deleteById(StudentId studentId) {

    }

    @Override
    public boolean isIdExists(StudentId studentId) {
        return false;
    }
}
