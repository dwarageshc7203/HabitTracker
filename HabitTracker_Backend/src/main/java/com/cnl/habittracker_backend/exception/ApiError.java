package com.cnl.habittracker_backend.exception;

import java.time.Instant;

public record ApiError(
        Instant timestamp,
        int status,
        String message
) {
}
