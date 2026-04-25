package com.smartcampus.notifications.service;

import com.smartcampus.common.exception.ResourceNotFoundException;
import com.smartcampus.notifications.model.Notification;
import com.smartcampus.notifications.model.NotificationType;
import com.smartcampus.notifications.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(
            String recipientEmail,
            String title,
            String message,
            NotificationType type,
            String referenceType,
            String referenceId
    ) {
        Notification notification = new Notification();
        notification.setRecipientEmail(recipientEmail.toLowerCase());
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceType(referenceType);
        notification.setReferenceId(referenceId);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public Page<Notification> getNotifications(String recipientEmail, boolean onlyUnread, Pageable pageable) {
        if (onlyUnread) {
            return notificationRepository.findByRecipientEmailAndReadFalseOrderByCreatedAtDesc(
                    recipientEmail.toLowerCase(), pageable
            );
        }
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(recipientEmail.toLowerCase(), pageable);
    }

    public long countUnread(String recipientEmail) {
        return notificationRepository.countByRecipientEmailAndReadFalse(recipientEmail.toLowerCase());
    }

    public Notification markAsRead(String notificationId, String recipientEmail) {
        Notification notification = notificationRepository.findByIdAndRecipientEmail(
                        notificationId, recipientEmail.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return notification;
    }

    public long markAllAsRead(String recipientEmail) {
        Page<Notification> page = notificationRepository.findByRecipientEmailAndReadFalseOrderByCreatedAtDesc(
                recipientEmail.toLowerCase(), Pageable.unpaged()
        );
        page.getContent().forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(page.getContent());
        return page.getTotalElements();
    }
}
