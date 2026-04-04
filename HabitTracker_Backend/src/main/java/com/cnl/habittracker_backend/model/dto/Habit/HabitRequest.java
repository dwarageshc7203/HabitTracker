package com.cnl.habittracker_backend.model.dto.Habit;

import java.util.List;

public record HabitRequest(

        int userId,
        String habitName,
        String habitDescription,
        List<String> habitTags

) {
}
