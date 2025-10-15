package uk.ac.bristol.cs.carc.user.application.port.out;

import org.springframework.stereotype.Component;
import uk.ac.bristol.cs.carc.user.application.domain.model.Student;

@Component
public interface CreateStudentPort {

    Student save(Student student);
}
