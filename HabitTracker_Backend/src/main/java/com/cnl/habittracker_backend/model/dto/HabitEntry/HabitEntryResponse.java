package com.cnl.habittracker_backend.model.dto.HabitEntry;

import java.time.Instant;

public record HabitEntryResponse(

        int entryId,
        int userId,
        int habitId,
        String entryStatus,
        Instant completedAt

) {
}
