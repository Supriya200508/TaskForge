package com.taskforge.repository;

import com.taskforge.entity.TaskDependency;
import com.taskforge.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskDependencyRepository extends JpaRepository<TaskDependency, Long> {
    List<TaskDependency> findByTask(Task task);
    List<TaskDependency> findByDependsOn(Task dependsOn);
}
