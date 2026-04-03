package com.cnl.habittracker_backend.model.dto;

import java.time.Instant;

public record UsersResponse(

        int userId,
        String userName,
        String password,
        int streaks,
        Instant createdAt

) {
}
