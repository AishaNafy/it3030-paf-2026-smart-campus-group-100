package com.smartcampus.booking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.smartcampus.auth.util.SecurityUtils;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    /** POST /api/bookings — create a new PENDING booking */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        // Security: For students, force the studentId to be their email
        if (SecurityUtils.hasRole("STUDENT")) {
            booking.setStudentId(SecurityUtils.currentUserEmail());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(booking));
    }

    /** GET /api/bookings — all bookings, optional ?status= filter */
    @GetMapping
    public ResponseEntity<List<Booking>> getBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String studentId) {
        
        String filterStudentId = studentId;
        if (SecurityUtils.hasRole("STUDENT")) {
            filterStudentId = SecurityUtils.currentUserEmail();
        }
        
        return ResponseEntity.ok(bookingService.getBookings(status, filterStudentId));
    }

    /** GET /api/bookings/{id} — single booking */
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable @org.springframework.lang.NonNull String id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    /** GET /api/bookings/deleted — deletion log (all deleted bookings + reasons) */
    @GetMapping("/deleted")
    public ResponseEntity<List<DeletedBooking>> getDeletedBookings() {
        return ResponseEntity.ok(bookingService.getDeletedBookings());
    }

    /** PUT /api/bookings/{id} — edit booking details, resets to PENDING */
    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
            @PathVariable @org.springframework.lang.NonNull String id,
            @RequestBody Booking updated) {
        return ResponseEntity.ok(bookingService.updateBooking(id, updated));
    }

    /**
     * PUT /api/bookings/{id}/status — workflow status change only.
     * Body: { "status": "APPROVED" | "REJECTED" | "CANCELLED", "reason": "..." }
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateStatus(
            @PathVariable @org.springframework.lang.NonNull String id,
            @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(
                bookingService.updateStatus(id, payload.get("status"), payload.get("reason")));
    }

    /**
     * DELETE /api/bookings/{id} — delete with reason.
     * Body: { "reason": "..." }
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable @org.springframework.lang.NonNull String id,
            @RequestBody(required = false) Map<String, String> payload) {
        String reason = payload != null ? payload.get("reason") : null;
        bookingService.deleteBooking(id, reason);
        return ResponseEntity.noContent().build();
    }
}
