package com.cnl.habittracker_backend.controller;

import com.cnl.habittracker_backend.model.dto.Habit.HabitRequest;
import com.cnl.habittracker_backend.model.dto.Habit.HabitResponse;
import com.cnl.habittracker_backend.service.HabitService;
import com.cnl.habittracker_backend.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class HabitController {

    @Autowired
    private HabitService service;

    @Autowired
    private SecurityUtil securityUtil;

    // Create Habit
    @PostMapping("/habits")
    public ResponseEntity<HabitResponse> createHabit(
            Authentication auth,
            @Valid @RequestBody HabitRequest habitRequest) {
        System.out.println("Create Habit method called");
        int userId = securityUtil.extractUserId(auth);
        return new ResponseEntity<>(service.createHabit(userId, habitRequest), HttpStatus.CREATED);
    }

    // Read Single Habit
    @GetMapping("/habits/{habitId}")
    public ResponseEntity<HabitResponse> getHabit(
            Authentication auth,
            @PathVariable int habitId) {
        System.out.println("Get Habit method called");
        int userId = securityUtil.extractUserId(auth);
        return new ResponseEntity<>(service.getHabit(userId, habitId), HttpStatus.OK);
    }

    // Read All Habits for the User
    @GetMapping("/habits")
    public ResponseEntity<List<HabitResponse>> getHabits(
            Authentication auth) {
        System.out.println("Get Habits method called");
        int userId = securityUtil.extractUserId(auth);
        return new ResponseEntity<>(service.getHabits(userId), HttpStatus.OK);
    }

    // Update Habit
    @PutMapping("/habits/{habitId}")
    public ResponseEntity<HabitResponse> updateHabit(
            Authentication auth,
            @PathVariable int habitId,
            @Valid @RequestBody HabitRequest request) {
        System.out.println("Update Habit method called");
        int userId = securityUtil.extractUserId(auth);
        return new ResponseEntity<>(service.updateHabit(userId, habitId, request), HttpStatus.OK);
    }

    // Patch Habit (same validation as create)
    @PatchMapping("/habits/{habitId}")
    public ResponseEntity<HabitResponse> patchHabit(
            Authentication auth,
            @PathVariable int habitId,
            @Valid @RequestBody HabitRequest request) {
        System.out.println("Patch Habit method called");
        int userId = securityUtil.extractUserId(auth);
        return new ResponseEntity<>(service.updateHabit(userId, habitId, request), HttpStatus.OK);
    }

    // Delete Habit
    @DeleteMapping("/habits/{habitId}")
    public ResponseEntity<Void> deleteHabit(
            Authentication auth,
            @PathVariable int habitId) {
        System.out.println("Delete Habit method called");
        int userId = securityUtil.extractUserId(auth);
        service.deleteHabit(userId, habitId);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
