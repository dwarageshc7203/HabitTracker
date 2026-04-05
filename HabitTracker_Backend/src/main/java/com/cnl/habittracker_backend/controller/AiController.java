package com.cnl.habittracker_backend.controller;

import com.cnl.habittracker_backend.model.dto.Ai.AiHabitSuggestion;
import com.cnl.habittracker_backend.model.dto.Ai.AiSuggestionRequest;
import com.cnl.habittracker_backend.service.AiSuggestionService;
import com.cnl.habittracker_backend.util.SecurityUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin
public class AiController {

    @Autowired
    private AiSuggestionService service;

    @Autowired
    private SecurityUtil securityUtil;

    @PostMapping("/suggest-habits")
    public ResponseEntity<List<AiHabitSuggestion>> suggestHabits(
            Authentication auth,
            @Valid @RequestBody AiSuggestionRequest request
    ) {
        int userId = securityUtil.extractUserId(auth);
        return new ResponseEntity<>(service.suggestHabits(userId, request.input()), HttpStatus.OK);
    }
}
