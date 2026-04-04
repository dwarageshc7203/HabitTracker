package com.cnl.habittracker_backend.model.dto.Habit;

import com.cnl.habittracker_backend.model.HabitDifficulty;

import java.time.Instant;

public record HabitResponse(

        int habitId,
        int userId,
        String habitName,
        String habitCategory,
        HabitDifficulty habitDifficulty,
        Instant createdAt,
        int currentStreak,
        int longestStreak,
        double completionRate

) {
}
