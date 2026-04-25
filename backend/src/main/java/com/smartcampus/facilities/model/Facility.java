package com.smartcampus.facilities.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "facilities")
public class Facility {
    @Id
    private String id;
    private String name;
    private String type; // e.g. Lecture Hall, Lab, Meeting Room, Equipment
    private String location;
    private int capacity;
    private String status; // e.g. ACTIVE, OUT_OF_SERVICE
    private String description;
    private String availabilityWindows; // e.g. 08:00 - 18:00
}
