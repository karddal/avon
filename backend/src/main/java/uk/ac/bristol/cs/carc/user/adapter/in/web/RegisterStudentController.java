package uk.ac.bristol.cs.carc.user.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import uk.ac.bristol.cs.carc.user.application.domain.model.Student;
import uk.ac.bristol.cs.carc.user.application.port.in.CreateStudentUseCase;
import uk.ac.bristol.cs.carc.user.application.port.in.RegisterStudentCommand;

@RestController
@RequiredArgsConstructor
public class RegisterStudentController {

    private final CreateStudentUseCase createStudentUseCase;

    @PostMapping(path = "/students/create")
    Student newStudent(@RequestBody @Valid RegisterStudentCommand newStudent) {
        return createStudentUseCase.createStudent(newStudent);
    }
}
