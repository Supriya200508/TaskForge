package com.taskforge.repository;

import com.taskforge.entity.Task;
import com.taskforge.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignedTo(User assignedTo);
    List<Task> findByCreatedBy(User createdBy);

    // Pagination & Filter for Admin
    @Query("SELECT t FROM Task t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:deadline IS NULL OR t.deadline = :deadline)")
    Page<Task> findAllWithFilters(@Param("status") com.taskforge.entity.TaskStatus status, 
                                  @Param("priority") com.taskforge.entity.Priority priority, 
                                  @Param("deadline") LocalDate deadline, 
                                  Pageable pageable);

    // Pagination & Filter for Manager/Employee
    @Query("SELECT t FROM Task t WHERE " +
           "(t.createdBy = :user OR t.assignedTo = :user) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:deadline IS NULL OR t.deadline = :deadline)")
    Page<Task> findMyTasksWithFilters(@Param("user") User user,
                                      @Param("status") com.taskforge.entity.TaskStatus status, 
                                      @Param("priority") com.taskforge.entity.Priority priority, 
                                      @Param("deadline") LocalDate deadline, 
                                      Pageable pageable);
}
