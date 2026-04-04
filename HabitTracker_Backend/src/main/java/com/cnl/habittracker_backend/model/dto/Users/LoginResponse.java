package com.cnl.habittracker_backend.model.dto.Users;

public record LoginResponse(
    String token,
    int userId,
    String userName,
    String message
) {
}

