package com.smartcampus.notifications.controller;

import com.smartcampus.auth.util.SecurityUtils;
import com.smartcampus.notifications.dto.BookingDecisionNotificationRequest;
import com.smartcampus.notifications.model.Notification;
import com.smartcampus.notifications.model.NotificationType;
import com.smartcampus.notifications.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<Page<Notification>> getNotifications(
            @RequestParam(defaultValue = "false") boolean onlyUnread,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications = notificationService.getNotifications(
                SecurityUtils.currentUserEmail(), onlyUnread, pageable
        );
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        long count = notificationService.countUnread(SecurityUtils.currentUserEmail());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        Notification notification = notificationService.markAsRead(id, SecurityUtils.currentUserEmail());
        return ResponseEntity.ok(notification);
    }

    @PatchMapping("/read-all")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<Map<String, Long>> markAllAsRead() {
        long updated = notificationService.markAllAsRead(SecurityUtils.currentUserEmail());
        return ResponseEntity.ok(Map.of("updatedCount", updated));
    }

    @PostMapping("/booking-decision")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Notification> notifyBookingDecision(
            @Valid @RequestBody BookingDecisionNotificationRequest request
    ) {
        String reasonSuffix = (request.getReason() == null || request.getReason().isBlank())
                ? ""
                : ". Reason: " + request.getReason().trim();

        Notification notification = notificationService.createNotification(
                request.getRecipientEmail(),
                "Booking " + request.getStatus(),
                "Your booking " + request.getBookingId() + " was " + request.getStatus().toLowerCase() + reasonSuffix,
                NotificationType.BOOKING_DECISION,
                "BOOKING",
                request.getBookingId()
        );
        return ResponseEntity.ok(notification);
    }
}
