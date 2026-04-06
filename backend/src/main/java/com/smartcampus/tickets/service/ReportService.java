package com.smartcampus.tickets.service;

import com.smartcampus.tickets.model.Ticket;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final MongoTemplate mongoTemplate;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Group by Status
        Aggregation statusAgg = newAggregation(
            group("status").count().as("count")
        );
        AggregationResults<Map> statusResults = mongoTemplate.aggregate(statusAgg, Ticket.class, Map.class);
        stats.put("ticketsByStatus", statusResults.getMappedResults());

        // Group by Priority
        Aggregation priorityAgg = newAggregation(
            group("priority").count().as("count")
        );
        AggregationResults<Map> priorityResults = mongoTemplate.aggregate(priorityAgg, Ticket.class, Map.class);
        stats.put("ticketsByPriority", priorityResults.getMappedResults());
        
        // Simulating monthly trends (would normally do date extraction aggregation)
        // Group by created month string for simplicity if mongo version supports it, else we fetch and group mentally
        // Let's do a simple count by category for more charts
        Aggregation categoryAgg = newAggregation(
                group("category").count().as("count")
        );
        AggregationResults<Map> categoryResults = mongoTemplate.aggregate(categoryAgg, Ticket.class, Map.class);
        stats.put("ticketsByCategory", categoryResults.getMappedResults());

        return stats;
    }
}
