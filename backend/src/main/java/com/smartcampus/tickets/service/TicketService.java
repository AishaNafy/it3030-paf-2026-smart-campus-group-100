package com.smartcampus.tickets.service;

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

    public Ticket createTicket(Ticket ticket) {
        ticket.setStatus("Open");
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id).orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public Page<Ticket> getTickets(String status, String priority, String category, String createdBy, String assignedTo, Pageable pageable) {
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

    public Ticket updateTicket(String id, Ticket ticketDetails) {
        Ticket ticket = getTicketById(id);
        
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
        
        return ticketRepository.save(ticket);
    }

    public void deleteTicket(String id) {
        ticketRepository.deleteById(id);
    }
}
