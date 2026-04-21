package com.smartcampus.Booking;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    // Filter bookings by the user's email (for "My Bookings" view)
    List<Booking> findByUserEmail(String userEmail);

    // Filter bookings by status (for admin filters)
    List<Booking> findByStatus(String status);

    // Filter by user email AND status
    List<Booking> findByUserEmailAndStatus(String userEmail, String status);

    /**
     * Conflict detection: find any APPROVED or PENDING booking for the same
     * resource on the same date whose time range overlaps with [newStart, newEnd].
     *
     * Overlap condition: existingStart < newEnd  AND  existingEnd > newStart
     */
    @Query("{ 'resourceId': ?0, 'date': ?1, 'status': { $in: ['PENDING','APPROVED'] }, " +
           "'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }")
    List<Booking> findConflictingBookings(Long resourceId,
                                          LocalDate date,
                                          LocalTime newStart,
                                          LocalTime newEnd);
}
