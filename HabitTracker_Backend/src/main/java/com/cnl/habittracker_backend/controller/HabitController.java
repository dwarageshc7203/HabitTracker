package com.cnl.habittracker_backend.controller;

import com.cnl.habittracker_backend.model.dto.HabitRequest;
import com.cnl.habittracker_backend.model.dto.HabitResponse;
import com.cnl.habittracker_backend.service.HabitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin
public class HabitController {

    @Autowired
    private HabitService service;

    //Create Habit
    public HabitResponse createHabit(HabitRequest habitRequest) {
        System.out.println("Habit request received");
        return service.createHabit(habitRequest);
    }

    //Read Habit

    //Read Habits

    //Update Habit

    //Delete Habit
}
