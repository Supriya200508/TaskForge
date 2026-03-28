package com.taskforge.service;

import com.taskforge.entity.AuditLog;
import com.taskforge.entity.Task;
import com.taskforge.entity.User;
import com.taskforge.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void logAction(Task task, User user, String action, String details) {
        AuditLog log = new AuditLog(task, user, action, details);
        auditLogRepository.save(log);
    }

    public List<AuditLog> getLogsForTask(Long taskId) {
        return auditLogRepository.findByTaskIdOrderByTimestampDesc(taskId);
    }
}
