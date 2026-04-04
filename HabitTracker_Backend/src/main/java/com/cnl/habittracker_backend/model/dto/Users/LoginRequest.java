package com.cnl.habittracker_backend.model.dto.Users;

public record LoginRequest(
    String email,
    String password
) {
}

