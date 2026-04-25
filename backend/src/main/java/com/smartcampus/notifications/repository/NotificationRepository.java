package com.smartcampus.notifications.repository;

import com.smartcampus.notifications.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    Page<Notification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail, Pageable pageable);
    Page<Notification> findByRecipientEmailAndReadFalseOrderByCreatedAtDesc(String recipientEmail, Pageable pageable);
    long countByRecipientEmailAndReadFalse(String recipientEmail);
    Optional<Notification> findByIdAndRecipientEmail(String id, String recipientEmail);
}
