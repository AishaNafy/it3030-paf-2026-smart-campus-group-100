package com.smartcampus.tickets.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "comments")
public class Comment {
    @Id
    private String id;
    
    private String ticketId;
    private String author;
    private String content;
    
    private LocalDateTime createdAt;
}
