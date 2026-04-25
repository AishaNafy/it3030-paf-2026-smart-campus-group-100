package com.smartcampus.auth.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "users")
public class AppUser {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String name;
    private String phoneNumber;
    private String nic;
    private String passwordHash;

    private String pictureUrl;
    private String provider;
    private String providerId;
    private Role role;

    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}
