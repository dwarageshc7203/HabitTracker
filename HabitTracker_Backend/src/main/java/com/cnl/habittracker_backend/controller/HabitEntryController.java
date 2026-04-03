package com.cnl.habittracker_backend.controller;

import com.cnl.habittracker_backend.model.dto.HabitEntry.HabitEntryRequest;
import com.cnl.habittracker_backend.model.dto.HabitEntry.HabitEntryResponse;
import com.cnl.habittracker_backend.service.HabitEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class HabitEntryController {

    @Autowired
    private HabitEntryService service;

    @PostMapping("/habits/{habitId}/entries")
    public ResponseEntity<HabitEntryResponse> createEntry(@PathVariable int habitId, @RequestBody HabitEntryRequest request) {
        return new ResponseEntity<>(service.createEntry(request), HttpStatus.OK);
    }

    @GetMapping("/habits/{habitId}/entries")
    public ResponseEntity<List<HabitEntryResponse>> getEntryHabit(@PathVariable int habitId) {
        return new ResponseEntity<>(service.getEntryHistory(habitId), HttpStatus.OK);
    }

    @GetMapping("/users/{userId}/entries")
    public ResponseEntity<List<HabitEntryResponse>> getEntries(@PathVariable int userId) {
        return new ResponseEntity<>(service.getEntries(userId), HttpStatus.OK);
    }

}
