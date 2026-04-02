package com.smartcampus.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "tickets")
public class Ticket {
    
    @Id
    private String id;
    
    private String title;
    private String description;
    
    // New fields
    private String phoneNumber;
    private String email;
    private String incidentDate;
    
    // e.g. IT, Maintenance, Cleaning
    private String category;
    
    // e.g. Low, Medium, High, Critical
    private String priority;
    
    // e.g. Open, In Progress, Resolved, Closed
    private String status;
    
    private String createdBy; // ID or username
    private String assignedTo; // ID or username of technician
    
    private String resolutionNotes;
    
    private List<String> attachments; // list of file URLs
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
