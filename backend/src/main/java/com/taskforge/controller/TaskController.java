package com.taskforge.controller;

import com.taskforge.dto.TaskRequest;
import com.taskforge.entity.Priority;
import com.taskforge.entity.Task;
import com.taskforge.entity.TaskStatus;
import com.taskforge.entity.User;
import com.taskforge.repository.UserRepository;
import com.taskforge.security.services.UserDetailsImpl;
import com.taskforge.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserRepository userRepository;

    // Get all tasks (Admin) with filters and pagination
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Task>> getAllTasks(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) LocalDate deadline,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(taskService.getAllTasks(status, priority, deadline, pageable));
    }

    // Get tasks relevant to the user
    @GetMapping("/my-tasks")
    @PreAuthorize("hasRole('MANAGER') or hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<Page<Task>> getMyTasks(
            Authentication authentication,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) LocalDate deadline,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User currentUser = userRepository.findById(userDetails.getId()).orElseThrow();
        
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(taskService.getMyTasks(currentUser, status, priority, deadline, pageable));
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> createTask(@RequestBody TaskRequest taskRequest, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User manager = userRepository.findById(userDetails.getId()).orElseThrow();
        
        Task task = taskService.createTask(taskRequest, manager);
        return ResponseEntity.ok(task);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('EMPLOYEE') or hasRole('ADMIN')")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody TaskRequest taskRequest, Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User currentUser = userRepository.findById(userDetails.getId()).orElseThrow();
            
            Task task = taskService.updateTask(id, taskRequest, currentUser);
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        try {
            taskService.deleteTask(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Task deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
