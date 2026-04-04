package com.cnl.habittracker_backend.model.dto.Ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiSuggestionRequest(
        @NotBlank(message = "input is required")
        @Size(max = 800, message = "input must be at most 800 characters")
        String input
) {
}
