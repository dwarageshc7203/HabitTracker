package com.cnl.habittracker_backend.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtil {

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Extracts userId from JWT token in Authorization header
     * @param authHeader Authorization header value (e.g., "Bearer token...")
     * @return userId extracted from token
     * @throws RuntimeException if token is invalid or missing
     */
    public int extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid or missing Authorization header");
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.isTokenValid(token)) {
            throw new RuntimeException("Invalid or expired token");
        }

        return jwtUtil.extractUserId(token);
    }

    public int extractUserId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Unauthenticated request");
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof Integer) {
            return (Integer) principal;
        }

        if (principal instanceof String) {
            return Integer.parseInt((String) principal);
        }

        throw new RuntimeException("Invalid authentication principal");
    }
}

