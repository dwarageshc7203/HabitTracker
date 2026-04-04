package com.cnl.habittracker_backend.model.dto.Ai;

import com.cnl.habittracker_backend.model.HabitDifficulty;

public record AiHabitSuggestion(
        String habitName,
        String habitCategory,
        HabitDifficulty habitDifficulty
) {
}
