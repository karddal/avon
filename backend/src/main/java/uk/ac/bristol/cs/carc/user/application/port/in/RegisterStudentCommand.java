package uk.ac.bristol.cs.carc.user.application.port.in;

import jakarta.validation.constraints.NotBlank;

public record RegisterStudentCommand(
        @NotBlank(message = "First name must not be blank.") String firstName,
        @NotBlank(message = "Last name must not be blank.") String lastName) {
    public RegisterStudentCommand(String firstName, String lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
        //        validate(this);
    }
}
