package com.smartcampus.Booking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired private BookingRepository        repository;
    @Autowired private SequenceGeneratorService sequenceGenerator;

    // ── CREATE ──────────────────────────────────────────────────────

    public Booking createBooking(Booking booking) {

        if (booking.getStudentId() == null || booking.getStudentId().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student ID is required.");
        if (booking.getLocation() == null || booking.getLocation().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Location is required.");
        if (booking.getDate() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date is required.");
        if (booking.getStartTime() == null || booking.getEndTime() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start and end time are required.");
        if (!booking.getEndTime().isAfter(booking.getStartTime()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time.");

        // Conflict check (exclude self — not needed for create but kept consistent)
        checkConflict(booking.getLocation().trim(), booking.getDate(),
                      booking.getStartTime(), booking.getEndTime(), null);

        booking.setId(sequenceGenerator.generateAvailableId());
        booking.setStatus("PENDING");
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        return repository.save(booking);
    }

    // ── READ ─────────────────────────────────────────────────────────

    public List<Booking> getBookings(String status) {
        if (status != null && !status.isBlank()) return repository.findByStatus(status);
        return repository.findAll();
    }

    public Booking getBookingById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Booking " + id + " not found."));
    }

    // ── EDIT (update booking details) ────────────────────────────────

    /**
     * Allows editing of any booking's details (location, date, times, purpose,
     * attendees, studentId). Resets status to PENDING after edit so admin
     * re-reviews the updated request.
     * Also re-runs conflict check, excluding the booking being edited.
     */
    public Booking updateBooking(String id, Booking updated) {
        Booking existing = getBookingById(id);

        // Validate incoming fields
        if (updated.getStudentId() == null || updated.getStudentId().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student ID is required.");
        if (updated.getLocation() == null || updated.getLocation().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Location is required.");
        if (updated.getDate() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date is required.");
        if (updated.getStartTime() == null || updated.getEndTime() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start and end time are required.");
        if (!updated.getEndTime().isAfter(updated.getStartTime()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time.");
        if (updated.getAttendees() < 1)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Attendees must be at least 1.");

        // Conflict check — exclude self so the same booking doesn't block its own edit
        checkConflict(updated.getLocation().trim(), updated.getDate(),
                      updated.getStartTime(), updated.getEndTime(), id);

        // Apply updates
        existing.setStudentId(updated.getStudentId().trim().toUpperCase());
        existing.setLocation(updated.getLocation().trim());
        existing.setDate(updated.getDate());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setPurpose(updated.getPurpose());
        existing.setAttendees(updated.getAttendees());

        // Reset to PENDING so admin re-reviews the edited booking
        existing.setStatus("PENDING");
        existing.setRejectionReason(null);
        existing.setUpdatedAt(LocalDateTime.now());

        return repository.save(existing);
    }

    // ── STATUS UPDATE ─────────────────────────────────────────────────

    public Booking updateStatus(String id, String newStatus, String reason) {
        Booking booking = getBookingById(id);
        String current  = booking.getStatus();

        boolean valid = switch (current) {
            case "PENDING"  -> newStatus.equals("APPROVED") || newStatus.equals("REJECTED");
            case "APPROVED" -> newStatus.equals("CANCELLED");
            default         -> false;
        };
        if (!valid)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot transition from " + current + " to " + newStatus + ".");

        booking.setStatus(newStatus);
        if ("REJECTED".equals(newStatus) && reason != null && !reason.isBlank())
            booking.setRejectionReason(reason);
        booking.setUpdatedAt(LocalDateTime.now());
        return repository.save(booking);
    }

    // ── DELETE ───────────────────────────────────────────────────────

    public void deleteBooking(String id) {
        repository.delete(getBookingById(id));
    }

    // ── HELPERS ──────────────────────────────────────────────────────

    /**
     * Conflict check helper.
     * @param excludeId  The booking ID to exclude from conflict check (for self-edit).
     *                   Pass null when creating.
     */
    private void checkConflict(String location,
                                java.time.LocalDate date,
                                java.time.LocalTime start,
                                java.time.LocalTime end,
                                String excludeId) {

        List<Booking> conflicts = repository.findConflictingBookings(location, date, start, end);

        // Remove self from conflict list when editing
        if (excludeId != null) {
            conflicts = conflicts.stream()
                    .filter(b -> !b.getId().equals(excludeId))
                    .collect(Collectors.toList());
        }

        if (!conflicts.isEmpty()) {
            Booking clash = conflicts.get(0);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This location (" + location + ") is already booked on " +
                    date + " from " + clash.getStartTime() +
                    " to " + clash.getEndTime() +
                    ". Please choose a different time slot.");
        }
    }
}
