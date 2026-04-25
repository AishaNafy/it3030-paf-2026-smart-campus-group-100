package com.smartcampus.auth.dto;

import com.smartcampus.auth.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateStudentAccountRequest {

    @NotBlank(message = "name is required")
    @Size(max = 100, message = "name must be at most 100 characters")
    private String name;

    @NotBlank(message = "phoneNumber is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "phoneNumber must contain exactly 10 digits")
    private String phoneNumber;

    @NotBlank(message = "email is required")
    @Email(message = "email must be valid")
    private String email;

    @NotBlank(message = "nic is required")
    @Pattern(regexp = "^(\\d{9}[VvXx]|\\d{12})$", message = "nic must be either 9 digits + V/X or 12 digits")
    private String nic;

    @NotBlank(message = "temporaryPassword is required")
    @Size(min = 6, max = 100, message = "temporaryPassword must be between 6 and 100 characters")
    private String temporaryPassword;

    private Role role;
}
