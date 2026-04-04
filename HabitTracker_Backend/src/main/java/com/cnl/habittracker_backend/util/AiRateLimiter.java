package com.cnl.habittracker_backend.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
public class AiRateLimiter {
    private final ConcurrentHashMap<Integer, Window> windows = new ConcurrentHashMap<>();
    private final Duration windowSize;
    private final int maxRequests;

    public AiRateLimiter(
            @Value("${gemini.rate-limit.window-seconds:60}") int windowSeconds,
            @Value("${gemini.rate-limit.max-requests:8}") int maxRequests
    ) {
        this.windowSize = Duration.ofSeconds(windowSeconds);
        this.maxRequests = maxRequests;
    }

    public boolean allow(int userId) {
        Instant now = Instant.now();
        AtomicBoolean allowed = new AtomicBoolean(false);

        windows.compute(userId, (id, existing) -> {
            if (existing == null || existing.isExpired(now, windowSize)) {
                allowed.set(true);
                return new Window(now, 1);
            }
            if (existing.count < maxRequests) {
                existing.count++;
                allowed.set(true);
            }
            return existing;
        });

        return allowed.get();
    }

    private static final class Window {
        private Instant start;
        private int count;

        private Window(Instant start, int count) {
            this.start = start;
            this.count = count;
        }

        private boolean isExpired(Instant now, Duration windowSize) {
            return Duration.between(start, now).compareTo(windowSize) >= 0;
        }
    }
}
