package com.smartcampus.Booking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Generates strictly incrementing booking IDs (B001, B002, …).
 *
 * IDs are NEVER reused after deletion — the next ID is always
 * max(existing active IDs, existing deleted IDs) + 1.
 * This preserves a clean audit trail.
 */
@Service
public class SequenceGeneratorService {

    @Autowired private BookingRepository        bookingRepository;
    @Autowired private DeletedBookingRepository deletedBookingRepository;

    public String generateAvailableId() {
        int maxActive  = maxFrom(bookingRepository.findAll()
                .stream().map(Booking::getId).toList());

        int maxDeleted = maxFrom(deletedBookingRepository.findAll()
                .stream().map(DeletedBooking::getBookingId).toList());

        int next = Math.max(maxActive, maxDeleted) + 1;
        return String.format("B%03d", next);
    }

    /** Parse the numeric part of IDs like "B005" → 5, return highest found (0 if none). */
    private int maxFrom(List<String> ids) {
        return ids.stream()
                .mapToInt(id -> {
                    try { return Integer.parseInt(id.substring(1)); }
                    catch (Exception e) { return 0; }
                })
                .max()
                .orElse(0);
    }
}
