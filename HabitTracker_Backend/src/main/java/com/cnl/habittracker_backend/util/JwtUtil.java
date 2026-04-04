package com.cnl.habittracker_backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret:MySecretKeyForHabitTrackerApplicationJwtTokenGenerationAndValidation2026}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")  // 24 hours in milliseconds
    private long jwtExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // Generate JWT Token
    public String generateToken(int userId, String userName) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("userName", userName)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    // Extract userId from token
    public int extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return Integer.parseInt(claims.getSubject());
    }

    // Extract username from token
    public String extractUserName(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("userName", String.class);
    }

    // Validate token
    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Extract all claims
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}



