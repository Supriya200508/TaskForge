package com.taskforge.dto;

import com.taskforge.entity.Priority;
import com.taskforge.entity.TaskStatus;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskRequest {
    private String title;
    private String description;
    private Priority priority;
    private TaskStatus status;
    private LocalDate deadline;
    private Long assignedToId;
    private java.util.List<Long> dependencyIds;
}
