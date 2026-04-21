package com.smartcampus.Booking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Generates sequential booking IDs in the format B001, B002, …
 * Reuses IDs that were freed by deletions.
 */
@Service
public class SequenceGeneratorService {

    @Autowired
    private BookingRepository repository;

    public String generateAvailableId() {
        List<Booking> allBookings = repository.findAll();

        // Collect the numeric portion of each existing ID (e.g. "B005" → 5)
        Set<Integer> usedNumbers = allBookings.stream()
                .map(b -> {
                    try {
                        return Integer.parseInt(b.getId().substring(1));
                    } catch (Exception e) {
                        return 0;
                    }
                })
                .collect(Collectors.toSet());

        // Find the first unused positive integer
        int next = 1;
        while (usedNumbers.contains(next)) {
            next++;
        }

        return String.format("B%03d", next);
    }
}
