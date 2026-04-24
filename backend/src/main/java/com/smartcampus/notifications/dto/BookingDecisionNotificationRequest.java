package com.smartcampus.notifications.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class BookingDecisionNotificationRequest {

    @NotBlank(message = "recipientEmail is required")
    private String recipientEmail;

    @NotBlank(message = "bookingId is required")
    private String bookingId;

    @NotBlank(message = "status is required")
    @Pattern(
            regexp = "APPROVED|REJECTED",
            message = "status must be APPROVED or REJECTED"
    )
    private String status;

    private String reason;
}
