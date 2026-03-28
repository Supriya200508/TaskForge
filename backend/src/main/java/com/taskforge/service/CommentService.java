package com.taskforge.service;

import com.taskforge.entity.Comment;
import com.taskforge.entity.Task;
import com.taskforge.entity.User;
import com.taskforge.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    public List<Comment> getCommentsForTask(Task task) {
        return commentRepository.findByTaskOrderByCreatedAtAsc(task);
    }

    public Comment createComment(Task task, User user, String text, String attachmentUrl) {
        Comment comment = new Comment();
        comment.setTask(task);
        comment.setUser(user);
        comment.setText(text);
        comment.setAttachmentUrl(attachmentUrl);
        comment.setCreatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }
}
