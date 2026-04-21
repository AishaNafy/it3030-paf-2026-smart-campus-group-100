package com.smartcampus.Booking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository repository;

    @Autowired
    private SequenceGeneratorService sequenceGenerator;

    // ── CREATE ──────────────────────────────────────────────────────

    public Booking createBooking(Booking booking) {
        // Basic field validation
        if (booking.getResourceId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource ID is required.");
        }
        if (booking.getDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date is required.");
        }
        if (booking.getStartTime() == null || booking.getEndTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time and end time are required.");
        }
        if (!booking.getEndTime().isAfter(booking.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time.");
        }
        if (booking.getUserEmail() == null || booking.getUserEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User email is required.");
        }

        // Conflict check
        List<Booking> conflicts = repository.findConflictingBookings(
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime()
        );
        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This resource is already booked during the requested time slot.");
        }

        // Assign ID and timestamps
        booking.setId(sequenceGenerator.generateAvailableId());
        booking.setStatus("PENDING");
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        return repository.save(booking);
    }

    // ── READ ─────────────────────────────────────────────────────────

    /** Return all bookings (admin), or filtered by email and/or status */
    public List<Booking> getBookings(String email, String status) {
        if (email != null && status != null) {
            return repository.findByUserEmailAndStatus(email, status);
        }
        if (email != null) {
            return repository.findByUserEmail(email);
        }
        if (status != null) {
            return repository.findByStatus(status);
        }
        return repository.findAll();
    }

    public Booking getBookingById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Booking with ID " + id + " not found."));
    }

    // ── STATUS UPDATE (Admin: Approve / Reject; User: Cancel) ────────

    public Booking updateStatus(String id, String newStatus, String reason) {
        Booking booking = getBookingById(id);
        String current = booking.getStatus();

        // Enforce workflow rules
        boolean valid = switch (current) {
            case "PENDING"  -> newStatus.equals("APPROVED") || newStatus.equals("REJECTED");
            case "APPROVED" -> newStatus.equals("CANCELLED");
            default         -> false;
        };

        if (!valid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot transition booking from " + current + " to " + newStatus + ".");
        }

        booking.setStatus(newStatus);
        if ("REJECTED".equals(newStatus) && reason != null && !reason.isBlank()) {
            booking.setRejectionReason(reason);
        }
        booking.setUpdatedAt(LocalDateTime.now());
        return repository.save(booking);
    }

    // ── DELETE ───────────────────────────────────────────────────────

    public void deleteBooking(String id) {
        Booking booking = getBookingById(id);
        repository.delete(booking);
    }
}
