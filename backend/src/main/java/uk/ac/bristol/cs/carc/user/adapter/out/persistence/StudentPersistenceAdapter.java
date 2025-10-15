package uk.ac.bristol.cs.carc.user.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.ac.bristol.cs.carc.user.application.domain.model.Student;
import uk.ac.bristol.cs.carc.user.application.domain.model.User.UserId;
import uk.ac.bristol.cs.carc.user.application.port.out.CreateStudentPort;

@RequiredArgsConstructor
@Component
public class StudentPersistenceAdapter implements CreateStudentPort {

    private final SpringDataStudentRepository studentRepository;

    @Override
    public Student save(Student student) {
        StudentJpaEntity saved =
                studentRepository.save(
                        new StudentJpaEntity(student.getFirstName(), student.getLastName()));
        return Student.withId(new UserId(saved.getId()), saved.getFirstName(), saved.getLastName());
    }
}
