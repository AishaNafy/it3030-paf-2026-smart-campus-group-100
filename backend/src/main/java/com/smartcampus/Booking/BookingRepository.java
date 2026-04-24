package com.smartcampus.Booking;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByStudentId(String studentId);

    List<Booking> findByStatus(String status);

    /**
     * Conflict detection using plain String comparison.
     *
     * Since times are stored as "HH:mm" strings (ISO-formatted),
     * lexicographic comparison == chronological comparison.
     *
     * Overlap condition: existingStart < newEnd  AND  existingEnd > newStart
     * Same date + same location + PENDING or APPROVED only.
     */
    @Query("{ 'location': ?0, 'date': ?1, " +
           "'status': { $in: ['PENDING', 'APPROVED'] }, " +
           "'startTime': { $lt: ?3 }, " +
           "'endTime':   { $gt: ?2 } }")
    List<Booking> findConflictingBookings(String location,
                                          String date,
                                          String newStart,
                                          String newEnd);
}
