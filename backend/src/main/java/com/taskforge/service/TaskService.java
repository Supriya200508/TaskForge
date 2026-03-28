package com.taskforge.service;

import com.taskforge.dto.TaskRequest;
import com.taskforge.entity.*;
import com.taskforge.repository.TaskDependencyRepository;
import com.taskforge.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskDependencyRepository taskDependencyRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    public Page<Task> getAllTasks(TaskStatus status, Priority priority, LocalDate deadline, Pageable pageable) {
        return taskRepository.findAllWithFilters(status, priority, deadline, pageable);
    }

    public Page<Task> getMyTasks(User user, TaskStatus status, Priority priority, LocalDate deadline, Pageable pageable) {
        if (user.getRole() == Role.ADMIN) {
            return getAllTasks(status, priority, deadline, pageable);
        }
        return taskRepository.findMyTasksWithFilters(user, status, priority, deadline, pageable);
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    @Transactional
    public Task createTask(TaskRequest request, User manager) {
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setStatus(TaskStatus.TODO);
        task.setDeadline(request.getDeadline());
        task.setCreatedBy(manager);

        if (request.getAssignedToId() != null) {
            userService.findById(request.getAssignedToId()).ifPresent(task::setAssignedTo);
        }

        task = taskRepository.save(task);

        // Handle dependencies
        if (request.getDependencyIds() != null && !request.getDependencyIds().isEmpty()) {
            for (Long depId : request.getDependencyIds()) {
                Task depTask = taskRepository.findById(depId).orElse(null);
                if (depTask != null && !depTask.getId().equals(task.getId())) {
                    taskDependencyRepository.save(new TaskDependency(task, depTask));
                }
            }
        }

        auditLogService.logAction(task, manager, "CREATED_TASK", "Task created by manager");

        if (task.getAssignedTo() != null) {
            notificationService.createNotification(task.getAssignedTo(), "You have been assigned a new task: " + task.getTitle());
            auditLogService.logAction(task, manager, "ASSIGNED_TASK", "Task assigned to user " + task.getAssignedTo().getName());
        }

        return task;
    }

    @Transactional
    public Task updateTask(Long id, TaskRequest request, User currentUser) throws Exception {
        Task task = taskRepository.findById(id).orElseThrow(() -> new Exception("Task not found"));

        if (currentUser.getRole() == Role.EMPLOYEE) {
            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new Exception("You are not assigned to this task");
            }
            updateStatus(task, request.getStatus(), currentUser);
            
            if (request.getDescription() != null) {
                task.setDescription(task.getDescription() + "\n[Update]: " + request.getDescription());
                auditLogService.logAction(task, currentUser, "UPDATED_DESCRIPTION", "Employee appended description");
            }
        } else {
            // Manager / Admin Logic
            if (currentUser.getRole() == Role.MANAGER && !task.getCreatedBy().getId().equals(currentUser.getId())) {
                throw new Exception("You did not create this task");
            }

            if (request.getTitle() != null) task.setTitle(request.getTitle());
            if (request.getDescription() != null) task.setDescription(request.getDescription());
            if (request.getPriority() != null) task.setPriority(request.getPriority());
            if (request.getDeadline() != null) task.setDeadline(request.getDeadline());

            updateStatus(task, request.getStatus(), currentUser);

            if (request.getAssignedToId() != null) {
                User oldAssignee = task.getAssignedTo();
                User newAssignee = userService.findById(request.getAssignedToId()).orElse(null);
                if (newAssignee != null && (oldAssignee == null || !oldAssignee.getId().equals(newAssignee.getId()))) {
                    task.setAssignedTo(newAssignee);
                    auditLogService.logAction(task, currentUser, "REASSIGNED_TASK", "Task reassigned to " + newAssignee.getName());
                    notificationService.createNotification(newAssignee, "You have been reassigned to task: " + task.getTitle());
                }
            }
            
            // Re-sync dependencies
            if (request.getDependencyIds() != null) {
                List<TaskDependency> existingDeps = taskDependencyRepository.findByTask(task);
                taskDependencyRepository.deleteAll(existingDeps);
                for (Long depId : request.getDependencyIds()) {
                    Task depTask = taskRepository.findById(depId).orElse(null);
                    if (depTask != null && !depTask.getId().equals(task.getId())) {
                        taskDependencyRepository.save(new TaskDependency(task, depTask));
                    }
                }
            }
        }

        return taskRepository.save(task);
    }

    private void updateStatus(Task task, TaskStatus newStatus, User user) throws Exception {
        if (newStatus == null || task.getStatus() == newStatus) return;

        // Strict Status Lifecycle: TODO -> IN_PROGRESS -> COMPLETED
        if (task.getStatus() == TaskStatus.TODO && newStatus == TaskStatus.COMPLETED) {
            throw new Exception("Strict lifecycle workflow: Cannot jump from TODO to COMPLETED.");
        }
        if (task.getStatus() == TaskStatus.COMPLETED) {
            throw new Exception("Task is already COMPLETED. Cannot revert.");
        }

        // Task Dependency Feature: restrict completion if dependency is incomplete
        if (newStatus == TaskStatus.COMPLETED) {
            List<TaskDependency> deps = taskDependencyRepository.findByTask(task);
            for (TaskDependency dep : deps) {
                if (dep.getDependsOn().getStatus() != TaskStatus.COMPLETED) {
                    throw new Exception("Cannot complete task: Dependency '" + dep.getDependsOn().getTitle() + "' is not yet COMPLETED.");
                }
            }
        }

        String detail = "Status changed from " + task.getStatus() + " to " + newStatus;
        task.setStatus(newStatus);
        auditLogService.logAction(task, user, "STATUS_UPDATED", detail);

        if (user.getRole() == Role.EMPLOYEE && task.getCreatedBy() != null) {
            notificationService.createNotification(task.getCreatedBy(), 
                user.getName() + " updated the status of task '" + task.getTitle() + "' to " + newStatus);
        }
    }

    @Transactional
    public void deleteTask(Long id) throws Exception {
        Task task = taskRepository.findById(id).orElseThrow(() -> new Exception("Task not found"));
        // Remove dependencies where this task is involved
        List<TaskDependency> deps1 = taskDependencyRepository.findByTask(task);
        List<TaskDependency> deps2 = taskDependencyRepository.findByDependsOn(task);
        taskDependencyRepository.deleteAll(deps1);
        taskDependencyRepository.deleteAll(deps2);
        
        taskRepository.deleteById(id);
    }
}
