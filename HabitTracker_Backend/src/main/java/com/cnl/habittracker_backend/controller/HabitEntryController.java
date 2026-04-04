package com.cnl.habittracker_backend.controller;

import com.cnl.habittracker_backend.model.dto.HabitEntry.HabitEntryRequest;
import com.cnl.habittracker_backend.model.dto.HabitEntry.HabitEntryResponse;
import com.cnl.habittracker_backend.service.HabitEntryService;
import com.cnl.habittracker_backend.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class HabitEntryController {

    @Autowired
    private HabitEntryService service;

    @Autowired
    private SecurityUtil securityUtil;

    // Create entry for a habit
    @PostMapping("/habits/{habitId}/entries")
    public ResponseEntity<HabitEntryResponse> createEntry(
            @RequestHeader("Authorization") String token,
            @PathVariable int habitId,
            @RequestBody HabitEntryRequest request) {
        int userId = securityUtil.extractUserIdFromToken(token);
        return new ResponseEntity<>(service.createEntry(userId, request), HttpStatus.CREATED);
    }

    // Get entries for a specific habit
    @GetMapping("/habits/{habitId}/entries")
    public ResponseEntity<List<HabitEntryResponse>> getEntryHabit(
            @RequestHeader("Authorization") String token,
            @PathVariable int habitId) {
        int userId = securityUtil.extractUserIdFromToken(token);
        return new ResponseEntity<>(service.getEntryHistory(userId, habitId), HttpStatus.OK);
    }

    // Get all entries for the user
    @GetMapping("/entries")
    public ResponseEntity<List<HabitEntryResponse>> getEntries(
            @RequestHeader("Authorization") String token) {
        int userId = securityUtil.extractUserIdFromToken(token);
        return new ResponseEntity<>(service.getEntries(userId), HttpStatus.OK);
    }

}
