package com.cnl.habittracker_backend.controller;

import com.cnl.habittracker_backend.model.dto.HabitLog.HabitLogRequest;
import com.cnl.habittracker_backend.model.dto.HabitLog.HabitLogResponse;
import com.cnl.habittracker_backend.service.HabitLogService;
import com.cnl.habittracker_backend.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class HabitLogController {

    @Autowired
    private HabitLogService service;

    @Autowired
    private SecurityUtil securityUtil;

    @PostMapping("/habits/{habitId}/logs")
    public ResponseEntity<HabitLogResponse> createLog(
            @RequestHeader("Authorization") String token,
            @PathVariable int habitId,
            @Valid @RequestBody HabitLogRequest request) {
        int userId = securityUtil.extractUserIdFromToken(token);
        return new ResponseEntity<>(service.createLog(userId, habitId, request), HttpStatus.CREATED);
    }

    @GetMapping("/habits/{habitId}/logs")
    public ResponseEntity<List<HabitLogResponse>> getLogs(
            @RequestHeader("Authorization") String token,
            @PathVariable int habitId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        int userId = securityUtil.extractUserIdFromToken(token);
        return new ResponseEntity<>(service.getLogs(userId, habitId, from, to), HttpStatus.OK);
    }

    @DeleteMapping("/habits/{habitId}/logs")
    public ResponseEntity<Void> deleteLog(
            @RequestHeader("Authorization") String token,
            @PathVariable int habitId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        int userId = securityUtil.extractUserIdFromToken(token);
        service.deleteLog(userId, habitId, date);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
