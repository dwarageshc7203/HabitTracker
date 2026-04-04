package com.cnl.habittracker_backend.model.dto.HabitLog;

import com.cnl.habittracker_backend.model.HabitLogStatus;

import java.time.Instant;
import java.time.LocalDate;

public record HabitLogResponse(
        int logId,
        int habitId,
        LocalDate logDate,
        HabitLogStatus status,
        String timezone,
        Instant createdAt
) {
}
