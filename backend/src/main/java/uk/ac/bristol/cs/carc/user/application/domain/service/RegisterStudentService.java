package uk.ac.bristol.cs.carc.user.application.domain.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import uk.ac.bristol.cs.carc.user.application.domain.model.Student;
import uk.ac.bristol.cs.carc.user.application.port.in.CreateStudentUseCase;
import uk.ac.bristol.cs.carc.user.application.port.in.RegisterStudentCommand;
import uk.ac.bristol.cs.carc.user.application.port.out.CreateStudentPort;

@RequiredArgsConstructor
@Transactional
@Component
public class RegisterStudentService implements CreateStudentUseCase {

    private final CreateStudentPort createStudentPort;

    @Override
    public Student createStudent(RegisterStudentCommand command) {
        return createStudentPort.save(Student.withoutId(command.firstName(), command.lastName()));
    }
}
