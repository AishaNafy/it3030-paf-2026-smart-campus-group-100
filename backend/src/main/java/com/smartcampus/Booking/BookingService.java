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
        validateFields(booking);
        checkConflict(booking.getLocation(), booking.getDate(),
                      booking.getStartTime(), booking.getEndTime(), null);

        booking.setStudentId(booking.getStudentId().trim().toUpperCase());
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

    // ── EDIT ─────────────────────────────────────────────────────────

    public Booking updateBooking(String id, Booking updated) {
        Booking existing = getBookingById(id);
        validateFields(updated);
        checkConflict(updated.getLocation(), updated.getDate(),
                      updated.getStartTime(), updated.getEndTime(), id);

        existing.setStudentId(updated.getStudentId().trim().toUpperCase());
        existing.setLocation(updated.getLocation().trim());
        existing.setDate(updated.getDate());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setPurpose(updated.getPurpose());
        existing.setAttendees(updated.getAttendees());
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

    private void validateFields(Booking b) {
        if (b.getStudentId() == null || b.getStudentId().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student ID is required.");
        if (b.getLocation() == null || b.getLocation().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Location is required.");
        if (b.getDate() == null || b.getDate().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date is required.");
        if (b.getStartTime() == null || b.getStartTime().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time is required.");
        if (b.getEndTime() == null || b.getEndTime().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time is required.");
        // String lexicographic comparison works for "HH:mm" format
        if (b.getEndTime().compareTo(b.getStartTime()) <= 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "End time must be after start time.");
        if (b.getAttendees() < 1)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Attendees must be at least 1.");
    }

    private void checkConflict(String location, String date,
                                String start, String end,
                                String excludeId) {
        List<Booking> conflicts = repository.findConflictingBookings(
                location.trim(), date, start, end);

        if (excludeId != null) {
            conflicts = conflicts.stream()
                    .filter(b -> !b.getId().equals(excludeId))
                    .collect(Collectors.toList());
        }

        if (!conflicts.isEmpty()) {
            Booking clash = conflicts.get(0);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This location (" + location + ") is already booked on " + date +
                    " from " + clash.getStartTime() + " to " + clash.getEndTime() +
                    ". Please choose a different time slot.");
        }
    }
}
