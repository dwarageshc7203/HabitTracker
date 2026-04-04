package com.cnl.habittracker_backend.model.dto.Users;

import java.time.LocalDate;

public record UsersRequest(

        String userName,
        String email,
        String password,
        LocalDate dateOfBirth,
        String profilePhotoUrl,
        String endGoal

) {
}
