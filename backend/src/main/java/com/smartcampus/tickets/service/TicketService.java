package com.smartcampus.tickets.service;

import com.smartcampus.auth.service.AppUserService;
import com.smartcampus.notifications.model.NotificationType;
import com.smartcampus.notifications.service.NotificationService;
import com.smartcampus.tickets.model.Ticket;
import com.smartcampus.tickets.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final MongoTemplate mongoTemplate;
    private final NotificationService notificationService;
    private final AppUserService appUserService;

    public Ticket createTicket(Ticket ticket) {
        ticket.setStatus("Open");
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);
        
        // Notify Student of ticket creation
        notificationService.createNotification(
            saved.getCreatedBy(),
            "Ticket Created",
            "Your ticket '" + saved.getTitle() + "' has been successfully submitted.",
            NotificationType.TICKET_STATUS_CHANGE,
            "TICKET",
            saved.getId()
        );
        
        return saved;
    }

    public Ticket getTicketById(@org.springframework.lang.NonNull String id) {
        return ticketRepository.findById(id).orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public Page<Ticket> getTickets(String status, String priority, String category, String createdBy, String assignedTo, @org.springframework.lang.NonNull Pageable pageable) {
        Query query = new Query();
        
        if (status != null && !status.isEmpty()) {
            query.addCriteria(Criteria.where("status").is(status));
        }
        if (priority != null && !priority.isEmpty()) {
            query.addCriteria(Criteria.where("priority").is(priority));
        }
        if (category != null && !category.isEmpty()) {
            query.addCriteria(Criteria.where("category").is(category));
        }
        if (createdBy != null && !createdBy.isEmpty()) {
            query.addCriteria(Criteria.where("createdBy").is(createdBy));
        }
        if (assignedTo != null && !assignedTo.isEmpty()) {
            query.addCriteria(Criteria.where("assignedTo").is(assignedTo));
        }

        long count = mongoTemplate.count(query, Ticket.class);
        
        query.with(pageable);
        List<Ticket> tickets = mongoTemplate.find(query, Ticket.class);
        
        return new PageImpl<>(tickets, pageable, count);
    }

    public Ticket updateTicket(@org.springframework.lang.NonNull String id, Ticket ticketDetails) {
        Ticket ticket = getTicketById(id);
        
        String oldStatus = ticket.getStatus();
        String oldAssignedTo = ticket.getAssignedTo();
        
        if(ticketDetails.getTitle() != null) ticket.setTitle(ticketDetails.getTitle());
        if(ticketDetails.getDescription() != null) ticket.setDescription(ticketDetails.getDescription());
        if(ticketDetails.getCategory() != null) ticket.setCategory(ticketDetails.getCategory());
        if(ticketDetails.getPriority() != null) ticket.setPriority(ticketDetails.getPriority());
        if(ticketDetails.getPhoneNumber() != null) ticket.setPhoneNumber(ticketDetails.getPhoneNumber());
        if(ticketDetails.getEmail() != null) ticket.setEmail(ticketDetails.getEmail());
        if(ticketDetails.getIncidentDate() != null) ticket.setIncidentDate(ticketDetails.getIncidentDate());
        if(ticketDetails.getStatus() != null) ticket.setStatus(ticketDetails.getStatus());
        if(ticketDetails.getAssignedTo() != null) ticket.setAssignedTo(ticketDetails.getAssignedTo());
        if(ticketDetails.getResolutionNotes() != null) ticket.setResolutionNotes(ticketDetails.getResolutionNotes());
        
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket updated = ticketRepository.save(ticket);
        
        // 1. Notify Student if status changed
        if (updated.getStatus() != null && !updated.getStatus().equals(oldStatus)) {
            notificationService.createNotification(
                updated.getCreatedBy(),
                "Ticket Status Updated",
                "Your ticket '" + updated.getTitle() + "' is now " + updated.getStatus(),
                NotificationType.TICKET_STATUS_CHANGE,
                "TICKET",
                updated.getId()
            );
        }
        
        // 2. Notify Technician if assigned
        if (updated.getAssignedTo() != null && !updated.getAssignedTo().equals(oldAssignedTo)) {
            String techEmail = appUserService.getEmailForUser(updated.getAssignedTo());
            if (techEmail != null) {
                notificationService.createNotification(
                    techEmail,
                    "New Ticket Assigned",
                    "You have been assigned a new ticket: " + updated.getTitle(),
                    NotificationType.TICKET_STATUS_CHANGE,
                    "TICKET",
                    updated.getId()
                );
            }
        }
        
        return updated;
    }

    public void deleteTicket(@org.springframework.lang.NonNull String id) {
        ticketRepository.deleteById(id);
    }
}
