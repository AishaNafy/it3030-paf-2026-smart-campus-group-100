package com.smartcampus.Booking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.smartcampus.notifications.model.NotificationType;
import com.smartcampus.notifications.service.NotificationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired private BookingRepository        repository;
    @Autowired private DeletedBookingRepository deletedRepository;
    @Autowired private SequenceGeneratorService sequenceGenerator;
    @Autowired private NotificationService     notificationService;

    // ── CREATE ──────────────────────────────────────────────────────

    public Booking createBooking(Booking booking) {
        validateFields(booking);
        checkConflict(booking.getLocation(), booking.getDate(),
                      booking.getStartTime(), booking.getEndTime(), null);

        booking.setStudentId(booking.getStudentId().trim());
        booking.setId(sequenceGenerator.generateAvailableId());
        booking.setStatus("PENDING");
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = repository.save(booking);

        // Notify Student
        notificationService.createNotification(
            saved.getStudentId(),
            "Booking Request Submitted",
            "Your booking request for " + saved.getLocation() + " is pending review.",
            NotificationType.BOOKING_DECISION,
            "BOOKING",
            saved.getId()
        );

        return saved;
    }

    // ── READ ─────────────────────────────────────────────────────────

    public List<Booking> getBookings(String status, String studentId) {
        if (studentId != null && !studentId.isBlank()) {
            if (status != null && !status.isBlank()) {
                return repository.findByStudentId(studentId).stream()
                        .filter(b -> b.getStatus().equals(status))
                        .collect(Collectors.toList());
            }
            return repository.findByStudentId(studentId);
        }
        if (status != null && !status.isBlank()) return repository.findByStatus(status);
        return repository.findAll();
    }

    public Booking getBookingById(@org.springframework.lang.NonNull String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Booking " + id + " not found."));
    }

    /** Returns all deletion log entries, newest first. */
    public List<DeletedBooking> getDeletedBookings() {
        return deletedRepository.findAll().stream()
                .sorted((a, b) -> b.getDeletedAt().compareTo(a.getDeletedAt()))
                .collect(Collectors.toList());
    }

    // ── EDIT ─────────────────────────────────────────────────────────

    public Booking updateBooking(@org.springframework.lang.NonNull String id, Booking updated) {
        Booking existing = getBookingById(id);
        
        // Security check: Student can only update their own booking
        if (com.smartcampus.auth.util.SecurityUtils.hasRole("STUDENT")) {
            String currentEmail = com.smartcampus.auth.util.SecurityUtils.currentUserEmail();
            if (!existing.getStudentId().equalsIgnoreCase(currentEmail)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own bookings.");
            }
            updated.setStudentId(currentEmail);
        }
        
        validateFields(updated);
        checkConflict(updated.getLocation(), updated.getDate(),
                      updated.getStartTime(), updated.getEndTime(), id);

        existing.setStudentId(updated.getStudentId().trim());
        existing.setLocation(updated.getLocation().trim());
        existing.setDate(updated.getDate());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setPurpose(updated.getPurpose());
        existing.setAttendees(updated.getAttendees());
        existing.setStatus("PENDING");
        existing.setRejectionReason(null);
        existing.setUpdatedAt(LocalDateTime.now());
        Booking saved = repository.save(existing);

        // Notify Student
        notificationService.createNotification(
            saved.getStudentId(),
            "Booking Updated",
            "Your booking request for " + saved.getLocation() + " has been updated and is pending review.",
            NotificationType.BOOKING_DECISION,
            "BOOKING",
            saved.getId()
        );

        return saved;
    }

    // ── STATUS UPDATE ─────────────────────────────────────────────────

    public Booking updateStatus(@org.springframework.lang.NonNull String id, String newStatus, String reason) {
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
        Booking saved = repository.save(booking);

        // Notify Student
        notificationService.createNotification(
            saved.getStudentId(),
            "Booking Status: " + newStatus,
            "Your booking for " + saved.getLocation() + " is now " + newStatus + ".",
            NotificationType.BOOKING_DECISION,
            "BOOKING",
            saved.getId()
        );

        return saved;
    }

    // ── DELETE ───────────────────────────────────────────────────────

    /**
     * Deletes a booking and saves a log entry to DeletedBookings collection.
     * The original booking ID (e.g. B003) is preserved in the log and never reused.
     *
     * @param id     The booking ID to delete
     * @param reason Why it was deleted (required from frontend)
     */
    public void deleteBooking(@org.springframework.lang.NonNull String id, String reason) {
        Booking booking = getBookingById(id);

        // Security check: Student can only delete their own booking
        if (com.smartcampus.auth.util.SecurityUtils.hasRole("STUDENT")) {
            String currentEmail = com.smartcampus.auth.util.SecurityUtils.currentUserEmail();
            if (!booking.getStudentId().equalsIgnoreCase(currentEmail)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own bookings.");
            }
        }

        // Save deletion log before removing
        DeletedBooking log = new DeletedBooking();
        log.setBookingId(booking.getId());
        log.setStudentId(booking.getStudentId());
        log.setLocation(booking.getLocation());
        log.setDate(booking.getDate());
        log.setStartTime(booking.getStartTime());
        log.setEndTime(booking.getEndTime());
        log.setPurpose(booking.getPurpose());
        log.setDeleteReason(reason != null ? reason.trim() : "No reason provided");
        log.setDeletedAt(LocalDateTime.now());
        deletedRepository.save(log);

        repository.delete(booking);
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
        if (b.getEndTime().compareTo(b.getStartTime()) <= 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "End time must be after start time.");
        if (b.getAttendees() < 1)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Attendees must be at least 1.");
    }

    private void checkConflict(String location, String date,
                                String start, String end, String excludeId) {
        List<Booking> conflicts = repository.findConflictingBookings(
                location.trim(), date, start, end);

        if (excludeId != null)
            conflicts = conflicts.stream()
                    .filter(b -> !b.getId().equals(excludeId))
                    .collect(Collectors.toList());

        if (!conflicts.isEmpty()) {
            Booking clash = conflicts.get(0);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This location (" + location + ") is already booked on " + date +
                    " from " + clash.getStartTime() + " to " + clash.getEndTime() +
                    ". Please choose a different time slot.");
        }
    }
}
