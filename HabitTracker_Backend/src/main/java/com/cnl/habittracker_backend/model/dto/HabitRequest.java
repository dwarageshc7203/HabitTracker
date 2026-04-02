package com.cnl.habittracker_backend.model.dto;

import java.util.List;

public record HabitRequest(

        String habitName,
        String habitDescription,
        List<String> habitTags

) {
}
