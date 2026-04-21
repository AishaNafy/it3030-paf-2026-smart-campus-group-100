package com.smartcampus.Booking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    /**
     * POST /api/bookings
     * Create a new booking request (status starts as PENDING).
     * Returns 201 Created, or 400/409 on validation/conflict errors.
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        Booking created = bookingService.createBooking(booking);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/bookings
     * Returns all bookings. Supports optional filters:
     *   ?email=user@sliit.lk          → bookings for a specific user
     *   ?status=PENDING                → bookings with a given status
     *   ?email=...&status=...          → combined filter
     */
    @GetMapping
    public ResponseEntity<List<Booking>> getBookings(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(bookingService.getBookings(email, status));
    }

    /**
     * GET /api/bookings/{id}
     * Returns a single booking by ID. Returns 404 if not found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    /**
     * PUT /api/bookings/{id}/status
     * Admin: approve or reject a booking.
     * User:  cancel an approved booking.
     *
     * Request body: { "status": "APPROVED" | "REJECTED" | "CANCELLED", "reason": "..." }
     * Returns 200 OK, or 400 if the transition is invalid.
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String newStatus = payload.get("status");
        String reason    = payload.get("reason");
        return ResponseEntity.ok(bookingService.updateStatus(id, newStatus, reason));
    }

    /**
     * DELETE /api/bookings/{id}
     * Hard-delete a booking record (admin operation).
     * Returns 204 No Content.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
