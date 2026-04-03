package com.cnl.habittracker_backend.model.dto.Habit;

import java.time.Instant;
import java.util.List;

public record HabitResponse(

        int habitId,
        int userId,
        String habitName,
        String habitDescription,
        List<String> habitTags,
        Instant createdAt

) {
}
