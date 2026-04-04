package com.cnl.habittracker_backend.model.dto.Habit;

import com.cnl.habittracker_backend.model.HabitDifficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record HabitRequest(
        @NotBlank(message = "habitName is required")
        @Size(max = 120, message = "habitName must be at most 120 characters")
        String habitName,
        @NotBlank(message = "habitCategory is required")
        @Size(max = 60, message = "habitCategory must be at most 60 characters")
        String habitCategory,
        @NotNull(message = "habitDifficulty is required")
        HabitDifficulty habitDifficulty
) {
}
