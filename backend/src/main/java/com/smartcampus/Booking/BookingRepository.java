package com.smartcampus.Booking; // Removed the 's' to match folder structure

import org.springframework.data.mongodb.repository.MongoRepository; // Fixes import errors
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    
    // Fixes the "cannot find symbol findByUserEmail" in Controller
    List<Booking> findByUserEmail(String userEmail);
    
    // Note: MongoDB does not use @Query in the same way as JPA. 
    // Standard derived queries work best for basic filtering.
}