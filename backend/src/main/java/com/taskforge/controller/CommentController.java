package com.taskforge.controller;

import com.taskforge.entity.Comment;
import com.taskforge.entity.Task;
import com.taskforge.entity.User;
import com.taskforge.repository.TaskRepository;
import com.taskforge.repository.UserRepository;
import com.taskforge.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/api/tasks/{taskId}/comments")
    public ResponseEntity<?> getCommentsForTask(@PathVariable Long taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) return ResponseEntity.notFound().build();
        
        List<Comment> comments = commentService.getCommentsForTask(task);
        return ResponseEntity.ok(comments);
    }

    @MessageMapping("/tasks/{taskId}/chat")
    public void processMessage(@DestinationVariable Long taskId, @Payload Map<String, String> payload) {
        String text = payload.get("text");
        Long userId = Long.parseLong(payload.get("userId"));
        String attachmentUrl = payload.get("attachmentUrl");
        
        Task task = taskRepository.findById(taskId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        
        if (task != null && user != null && text != null && !text.trim().isEmpty()) {
            Comment comment = commentService.createComment(task, user, text, attachmentUrl);
            messagingTemplate.convertAndSend("/topic/tasks/" + taskId, comment);
        }
    }
}
