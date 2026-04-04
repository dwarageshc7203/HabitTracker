package com.cnl.habittracker_backend.model.dto.Users;

public record PasswordUpdateRequest(
    String currentPassword,
    String newPassword
) {
}
