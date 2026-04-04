package com.cnl.habittracker_backend.controller;

import com.cnl.habittracker_backend.model.Users;
import com.cnl.habittracker_backend.model.dto.Users.LoginRequest;
import com.cnl.habittracker_backend.model.dto.Users.LoginResponse;
import com.cnl.habittracker_backend.model.dto.Users.UsersRequest;
import com.cnl.habittracker_backend.model.dto.Users.UsersResponse;
import com.cnl.habittracker_backend.service.UsersService;
import com.cnl.habittracker_backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private UsersService usersService;

    @Autowired
    private JwtUtil jwtUtil;

    // Register new user
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody UsersRequest request) {
        System.out.println("Register method called");
        UsersResponse createdUser = usersService.createUser(request);
        String token = jwtUtil.generateToken(createdUser.userId(), createdUser.userName());

        LoginResponse response = new LoginResponse(
                token,
                createdUser.userId(),
                createdUser.userName(),
                "Registration successful"
        );

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Login user
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        System.out.println("Login method called for user: " + request.email());

        try {
            // Validate credentials
            Users user = usersService.authenticateUser(request.email(), request.password());

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getUserId(), user.getUserName());

            // Return token and user info
            LoginResponse response = new LoginResponse(
                    token,
                    user.getUserId(),
                    user.getUserName(),
                    "Login successful"
            );

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (RuntimeException e) {
            return new ResponseEntity<>(
                    new LoginResponse(null, 0, "", "Invalid credentials"),
                    HttpStatus.UNAUTHORIZED
            );
        }
    }

    // Validate token
    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            String jwtToken = token.substring(7);
            boolean isValid = jwtUtil.isTokenValid(jwtToken);
            return new ResponseEntity<>(isValid, HttpStatus.OK);
        }
        return new ResponseEntity<>(false, HttpStatus.BAD_REQUEST);
    }
}

