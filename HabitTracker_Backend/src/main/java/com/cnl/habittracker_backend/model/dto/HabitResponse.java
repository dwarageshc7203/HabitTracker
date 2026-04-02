package com.cnl.habittracker_backend.model.dto;

import java.time.Instant;
import java.util.List;

public record HabitResponse(

        int habitId,
        String habitName,
        String habitDescription,
        List<String> habitTags,
        Instant createdAt

) {
}
