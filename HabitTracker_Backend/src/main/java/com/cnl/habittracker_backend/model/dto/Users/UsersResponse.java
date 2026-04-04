package com.cnl.habittracker_backend.model.dto.Users;

import java.time.Instant;
import java.time.LocalDate;

public record UsersResponse(

        int userId,
        String userName,
        String email,
        LocalDate dateOfBirth,
        String profilePhotoUrl,
        String endGoal,
        int streaks,
        Instant createdAt

) {
}
