package com.cnl.habittracker_backend.controller;

import com.cnl.habittracker_backend.model.dto.Habit.HabitRequest;
import com.cnl.habittracker_backend.model.dto.Habit.HabitResponse;
import com.cnl.habittracker_backend.service.HabitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
public class HabitController {

    @Autowired
    private HabitService service;

    //Create Habit
    @PostMapping("/users/{userId}/habits")
    public ResponseEntity<HabitResponse> createHabit(@PathVariable int userId, @RequestBody HabitRequest habitRequest) {
        System.out.println("Create Habit method called");
        return new ResponseEntity<>(service.createHabit(userId, habitRequest), HttpStatus.OK);
    }

    //Read Habit
    @GetMapping("/habits/{habitId}")
    public ResponseEntity<HabitResponse> getHabit(@PathVariable int habitId) {
        System.out.println("Get Habit method called");
        return new ResponseEntity<>(service.getHabit(habitId), HttpStatus.OK);
    }


    //Read Habits
    @GetMapping("/habits")
    public ResponseEntity<List<HabitResponse>> getHabits() {
        System.out.println("Get Habits method called");
        return new ResponseEntity<>(service.getHabits(), HttpStatus.OK);
    }

    //Update Habit
    @PutMapping("/users/{userId}/habits/{habitId}")
    public ResponseEntity<HabitResponse> updateHabit(@PathVariable int userId, @PathVariable int habitId, @RequestBody HabitRequest request) {
        System.out.println("Update Habit method called");
        return new ResponseEntity<>(service.updateHabit(userId, habitId, request), HttpStatus.OK);
    }

    //Delete Habit
    @DeleteMapping("/habits/{habitId}")
    public ResponseEntity<Void> deleteHabit(@PathVariable int habitId) {
        System.out.println("Delete Habit method called");
        service.deleteHabit(habitId);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
