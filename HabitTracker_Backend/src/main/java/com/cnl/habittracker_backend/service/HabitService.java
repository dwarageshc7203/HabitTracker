package com.cnl.habittracker_backend.service;

import com.cnl.habittracker_backend.model.Habit;
import com.cnl.habittracker_backend.model.dto.HabitRequest;
import com.cnl.habittracker_backend.model.dto.HabitResponse;
import com.cnl.habittracker_backend.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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

        Habit savedHabit = repository.save(habit);

        HabitResponse response = new HabitResponse(
                savedHabit.getHabitId(),
                savedHabit.getHabitName(),
                savedHabit.getHabitDescription(),
                savedHabit.getHabitTags(),
                savedHabit.getCreatedAt()
        );

        System.out.println("Habit created");

        return response;
    }

    //read Habit
    public HabitResponse getHabit(int habitId) {

        Habit habit = repository.findById(habitId)
                .orElseThrow( () -> new RuntimeException("Habit not found") );

        return new HabitResponse(
                habit.getHabitId(),
                habit.getHabitName(),
                habit.getHabitDescription(),
                habit.getHabitTags(),
                habit.getCreatedAt()
        );
    }

    //read Habits
    public List<HabitResponse> getHabits() {

        return repository.findAll()
                .stream()
                .map(habit -> new HabitResponse(
                    habit.getHabitId(),
                    habit.getHabitName(),
                    habit.getHabitDescription(),
                    habit.getHabitTags(),
                    habit.getCreatedAt()
                ))
                .toList();
    }

    //update Habit
    public HabitResponse updateHabit(int habitId, HabitRequest request) {

        Habit habit = repository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        if (request.habitName() != null) {
            habit.setHabitName(request.habitName());
        }
        if (request.habitDescription() != null) {
            habit.setHabitDescription(request.habitDescription());
        }
        if (request.habitTags() != null) {
            habit.setHabitTags(request.habitTags());
        }

        Habit updatedHabit = repository.save(habit);

        System.out.println("Habit updated");

        return new HabitResponse(
                updatedHabit.getHabitId(),
                updatedHabit.getHabitName(),
                updatedHabit.getHabitDescription(),
                updatedHabit.getHabitTags(),
                updatedHabit.getCreatedAt()
        );
    }

    public void deleteHabit(int habitId) {
        repository.deleteById(habitId);
        System.out.println("Habit deleted");
    }
}
