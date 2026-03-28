package com.taskforge.repository;

import com.taskforge.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByTaskIdOrderByTimestampDesc(Long taskId);
    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);
}
