package com.smartcampus.tickets.service;

import com.smartcampus.tickets.model.Comment;
import com.smartcampus.tickets.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    
    private final CommentRepository commentRepository;
    
    public List<Comment> getCommentsByTicketId(@org.springframework.lang.NonNull String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }

    public Comment addComment(Comment comment) {
        comment.setCreatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    public void deleteComment(@org.springframework.lang.NonNull String id) {
        commentRepository.deleteById(id);
    }
}
