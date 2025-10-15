package uk.ac.bristol.cs.carc.user.application.port.in;

import uk.ac.bristol.cs.carc.user.application.domain.model.Student;

public interface CreateStudentUseCase {
    Student createStudent(RegisterStudentCommand command);
}
