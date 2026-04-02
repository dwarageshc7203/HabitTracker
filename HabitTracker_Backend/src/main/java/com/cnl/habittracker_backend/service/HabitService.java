package com.cnl.habittracker_backend.service;

import com.cnl.habittracker_backend.model.Habit;
import com.cnl.habittracker_backend.model.dto.HabitRequest;
import com.cnl.habittracker_backend.model.dto.HabitResponse;
import com.cnl.habittracker_backend.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class HabitService {

    @Autowired
    private HabitRepository repository;

    //create Habit
    public HabitResponse createHabit(HabitRequest request) {

        //map HabitRequest to HabitResponse

        Habit habit = new Habit();
        habit.setHabitName(request.habitName());
        habit.setHabitDescription(request.habitDescription());
        habit.setHabitTags(request.habitTags());

        repository.save(habit);

        HabitResponse response = new HabitResponse(
                habit.getHabitId(),
                habit.getHabitName(),
                habit.getHabitDescription(),
                habit.getHabitTags(),
                habit.getCreatedAt()
        );


        return response;
    }
}
