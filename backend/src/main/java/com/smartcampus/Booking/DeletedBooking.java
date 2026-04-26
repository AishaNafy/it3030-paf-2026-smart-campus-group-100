package com.smartcampus.booking;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Stores a log of deleted bookings so they can still be viewed
 * with the reason for deletion. IDs stored here are never reused.
 */
@Document(collection = "DeletedBookings")
public class DeletedBooking {

    @Id
    private String id;              // auto-generated mongo id

    private String bookingId;       // e.g. "B003" — the original booking ID
    private String studentId;
    private String location;
    private String date;
    private String startTime;
    private String endTime;
    private String purpose;
    private String deleteReason;
    private LocalDateTime deletedAt;

    public DeletedBooking() {}

    public String getId()                              { return id; }
    public void   setId(String id)                     { this.id = id; }

    public String getBookingId()                       { return bookingId; }
    public void   setBookingId(String bookingId)       { this.bookingId = bookingId; }

    public String getStudentId()                       { return studentId; }
    public void   setStudentId(String studentId)       { this.studentId = studentId; }

    public String getLocation()                        { return location; }
    public void   setLocation(String location)         { this.location = location; }

    public String getDate()                            { return date; }
    public void   setDate(String date)                 { this.date = date; }

    public String getStartTime()                       { return startTime; }
    public void   setStartTime(String startTime)       { this.startTime = startTime; }

    public String getEndTime()                         { return endTime; }
    public void   setEndTime(String endTime)           { this.endTime = endTime; }

    public String getPurpose()                         { return purpose; }
    public void   setPurpose(String purpose)           { this.purpose = purpose; }

    public String getDeleteReason()                    { return deleteReason; }
    public void   setDeleteReason(String deleteReason) { this.deleteReason = deleteReason; }

    public LocalDateTime getDeletedAt()                { return deletedAt; }
    public void          setDeletedAt(LocalDateTime v) { this.deletedAt = v; }
}
