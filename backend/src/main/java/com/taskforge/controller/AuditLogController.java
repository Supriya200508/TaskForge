package com.taskforge.controller;

import com.taskforge.entity.AuditLog;
import com.taskforge.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping("/tasks/{taskId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('EMPLOYEE')")
    public ResponseEntity<List<AuditLog>> getTaskLogs(@PathVariable Long taskId) {
        return ResponseEntity.ok(auditLogService.getLogsForTask(taskId));
    }
}
