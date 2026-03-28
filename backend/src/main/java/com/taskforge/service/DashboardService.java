package com.taskforge.service;

import com.taskforge.entity.Role;
import com.taskforge.entity.Task;
import com.taskforge.entity.TaskStatus;
import com.taskforge.entity.User;
import com.taskforge.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private TaskRepository taskRepository;

    public Map<String, Object> getDashboardMetrics(User currentUser) {
        List<Task> tasks;
        if (currentUser.getRole() == Role.ADMIN) {
            tasks = taskRepository.findAll();
        } else {
            // Manager's team performance
            tasks = taskRepository.findByCreatedBy(currentUser);
        }

        long totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long pendingTasks = tasks.stream().filter(t -> t.getStatus() != TaskStatus.COMPLETED).count();
        long overdueTasks = tasks.stream().filter(t -> 
                t.getDeadline() != null && 
                t.getDeadline().isBefore(LocalDate.now()) && 
                t.getStatus() != TaskStatus.COMPLETED
        ).count();

        // Advanced Metrics
        double efficiencyScore = totalTasks == 0 ? 0 : ((double) completedTasks / totalTasks) * 100;
        
        long completedOnTime = tasks.stream().filter(t -> 
            t.getStatus() == TaskStatus.COMPLETED && 
            t.getDeadline() != null && 
            !t.getDeadline().isBefore(LocalDate.now()) // Note: Simplification since we don't track completion date yet.
        ).count();
        
        double deadlineAdherence = completedTasks == 0 ? 0 : ((double) completedOnTime / completedTasks) * 100;

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalTasks", totalTasks);
        metrics.put("completedTasks", completedTasks);
        metrics.put("pendingTasks", pendingTasks);
        metrics.put("overdueTasks", overdueTasks);
        metrics.put("efficiencyScore", Math.round(efficiencyScore * 100.0) / 100.0);
        metrics.put("deadlineAdherencePct", Math.round(deadlineAdherence * 100.0) / 100.0);

        return metrics;
    }
}
