package com.cnl.habittracker_backend.model.dto.HabitLog;

import com.cnl.habittracker_backend.model.HabitLogStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record HabitLogRequest(
        @NotNull(message = "logDate is required")
        LocalDate logDate,
        @NotNull(message = "status is required")
        HabitLogStatus status,
        @Size(max = 80, message = "timezone must be at most 80 characters")
        String timezone
) {
}
