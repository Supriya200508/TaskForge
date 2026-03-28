package com.taskforge.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String action; // e.g., "CREATED_TASK", "STATUS_UPDATED", "ASSIGNED"

    @Column(columnDefinition = "TEXT")
    private String details; // e.g., "Status changed from TODO to IN_PROGRESS"

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
    
    public AuditLog(Task task, User user, String action, String details) {
        this.task = task;
        this.user = user;
        this.action = action;
        this.details = details;
    }
}
