package com.cnl.habittracker_backend.service;

import com.cnl.habittracker_backend.exception.BadRequestException;
import com.cnl.habittracker_backend.exception.TooManyRequestsException;
import com.cnl.habittracker_backend.model.HabitDifficulty;
import com.cnl.habittracker_backend.model.dto.Ai.AiHabitSuggestion;
import com.cnl.habittracker_backend.util.AiRateLimiter;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AiSuggestionService {
    private static final int MAX_SUGGESTIONS = 3;
    private static final int MAX_NAME_LENGTH = 120;
    private static final int MAX_CATEGORY_LENGTH = 60;

    private final ObjectMapper objectMapper;
    private final AiRateLimiter rateLimiter;
    private final HttpClient httpClient;
    private final String apiKey;
    private final String model;
    private final String endpoint;
    private final Duration timeout;

    public AiSuggestionService(
            ObjectMapper objectMapper,
            AiRateLimiter rateLimiter,
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.model:gemini-2.0-flash}") String model,
            @Value("${gemini.endpoint:https://generativelanguage.googleapis.com/v1beta/models}") String endpoint,
            @Value("${gemini.timeout-seconds:15}") int timeoutSeconds
    ) {
        this.objectMapper = objectMapper;
        this.rateLimiter = rateLimiter;
        this.apiKey = apiKey;
        this.model = model;
        this.endpoint = endpoint;
        this.timeout = Duration.ofSeconds(timeoutSeconds);
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(this.timeout)
                .build();
    }

    public List<AiHabitSuggestion> suggestHabits(int userId, String input) {
        if (!rateLimiter.allow(userId)) {
            throw new TooManyRequestsException("Too many requests. Please wait a moment.");
        }
        if (apiKey == null || apiKey.isBlank()) {
            throw new BadRequestException("AI service is not configured");
        }

        String prompt = buildPrompt(input);
        String rawText = callGemini(prompt);
        List<AiHabitSuggestion> suggestions = parseSuggestions(rawText);
        return sanitizeSuggestions(suggestions);
    }

    private String buildPrompt(String input) {
        return """
You are a habit coach. Return ONLY a JSON array of 2-3 objects.
Each object must use these keys: habitName, habitCategory, habitDifficulty.
habitName: string up to 120 characters.
habitCategory: string up to 60 characters.
habitDifficulty: one of EASY, MEDIUM, HARD.
No markdown. No extra text.
User input: "%s"
""".formatted(input.trim());
    }

    private String callGemini(String prompt) {
        try {
            String url = String.format("%s/%s:generateContent?key=%s", endpoint, model, apiKey);
            Map<String, Object> payload = Map.of(
                    "contents",
                    List.of(Map.of(
                            "role", "user",
                            "parts", List.of(Map.of("text", prompt))
                    )),
                    "generationConfig",
                    Map.of("temperature", 0.2, "maxOutputTokens", 300)
            );

            String body = objectMapper.writeValueAsString(payload);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(timeout)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                String details = extractErrorMessage(response.body());
                String message = details == null ? "AI service error" : "AI service error: " + details;
                throw new BadRequestException(message);
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode textNode = root.at("/candidates/0/content/parts/0/text");
            if (textNode.isMissingNode() || textNode.asText().isBlank()) {
                throw new BadRequestException("AI response was empty");
            }
            return textNode.asText();
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadRequestException("Unable to reach AI service");
        }
    }

    private List<AiHabitSuggestion> parseSuggestions(String rawText) {
        try {
            String json = extractJsonArray(rawText);
            return objectMapper.readValue(json, new TypeReference<List<AiHabitSuggestion>>() {});
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadRequestException("AI returned invalid JSON");
        }
    }

    private String extractErrorMessage(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return null;
        }
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode messageNode = root.at("/error/message");
            if (!messageNode.isMissingNode()) {
                String message = messageNode.asText();
                return message == null || message.isBlank() ? null : message;
            }
        } catch (Exception ex) {
            return null;
        }
        return null;
    }

    private String extractJsonArray(String rawText) {
        if (rawText == null) {
            throw new BadRequestException("AI returned invalid JSON");
        }
        String trimmed = rawText.trim();
        int start = trimmed.indexOf('[');
        int end = trimmed.lastIndexOf(']');
        if (start < 0 || end < 0 || end < start) {
            throw new BadRequestException("AI returned invalid JSON");
        }
        return trimmed.substring(start, end + 1);
    }

    private List<AiHabitSuggestion> sanitizeSuggestions(List<AiHabitSuggestion> suggestions) {
        if (suggestions == null || suggestions.isEmpty()) {
            throw new BadRequestException("AI returned no suggestions");
        }

        List<AiHabitSuggestion> cleaned = new ArrayList<>();
        for (AiHabitSuggestion suggestion : suggestions) {
            AiHabitSuggestion normalized = normalizeSuggestion(suggestion);
            if (normalized != null) {
                cleaned.add(normalized);
            }
            if (cleaned.size() >= MAX_SUGGESTIONS) {
                break;
            }
        }

        if (cleaned.isEmpty()) {
            throw new BadRequestException("AI returned no usable habits");
        }

        return cleaned;
    }

    private AiHabitSuggestion normalizeSuggestion(AiHabitSuggestion suggestion) {
        if (suggestion == null) {
            return null;
        }

        String name = safeTrim(suggestion.habitName());
        String category = safeTrim(suggestion.habitCategory());
        HabitDifficulty difficulty = suggestion.habitDifficulty() == null
                ? HabitDifficulty.MEDIUM
                : suggestion.habitDifficulty();

        if (name.isBlank() || category.isBlank()) {
            return null;
        }

        if (name.length() > MAX_NAME_LENGTH) {
            name = name.substring(0, MAX_NAME_LENGTH).trim();
        }
        if (category.length() > MAX_CATEGORY_LENGTH) {
            category = category.substring(0, MAX_CATEGORY_LENGTH).trim();
        }

        return new AiHabitSuggestion(name, category, difficulty);
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }
}
