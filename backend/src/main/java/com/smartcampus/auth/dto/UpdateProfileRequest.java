package com.smartcampus.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "name is required")
    @Size(max = 100, message = "name must be at most 100 characters")
    private String name;

    @NotBlank(message = "phoneNumber is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "phoneNumber must contain exactly 10 digits")
    private String phoneNumber;

    @Pattern(regexp = "^$|(\\d{9}[VvXx]|\\d{12})$", message = "nic must be either 9 digits + V/X or 12 digits")
    private String nic;
}
