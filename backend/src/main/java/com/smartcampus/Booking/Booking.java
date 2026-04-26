package com.smartcampus.booking;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * date, startTime, endTime are stored as plain Strings (e.g. "2026-04-25", "14:30")
 * to prevent MongoDB/Spring from applying any timezone conversion.
 *
 * Previously using LocalDate / LocalTime caused UTC offset shifts
 * (Sri Lanka UTC+5:30 → values shifted backwards by 5h30m in MongoDB).
 */
@Document(collection = "Booking")
public class Booking {

    @Id
    private String id;

    private String studentId;
    private String location;

    // Stored as plain strings — no timezone conversion ever applied
    private String date;       // "YYYY-MM-DD"
    private String startTime;  // "HH:mm"
    private String endTime;    // "HH:mm"

    private String purpose;
    private int    attendees;

    private String status = "PENDING";
    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Booking() {}

    public String getId()                              { return id; }
    public void   setId(String id)                     { this.id = id; }

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

    public int  getAttendees()                         { return attendees; }
    public void setAttendees(int attendees)            { this.attendees = attendees; }

    public String getStatus()                          { return status; }
    public void   setStatus(String status)             { this.status = status; }

    public String getRejectionReason()                       { return rejectionReason; }
    public void   setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public LocalDateTime getCreatedAt()                { return createdAt; }
    public void          setCreatedAt(LocalDateTime v) { this.createdAt = v; }

    public LocalDateTime getUpdatedAt()                { return updatedAt; }
    public void          setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }
}
