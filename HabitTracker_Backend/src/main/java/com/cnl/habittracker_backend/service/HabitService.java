package com.cnl.habittracker_backend.service;

import com.cnl.habittracker_backend.model.Habit;
import com.cnl.habittracker_backend.model.Users;
import com.cnl.habittracker_backend.model.dto.Habit.HabitRequest;
import com.cnl.habittracker_backend.model.dto.Habit.HabitResponse;
import com.cnl.habittracker_backend.repository.HabitRepository;
import com.cnl.habittracker_backend.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HabitService {

    @Autowired
    private HabitRepository repository;

    @Autowired
    private UsersRepository usersRepository;

    //create Habit
    public HabitResponse createHabit(int userId, HabitRequest request) {

        //map HabitRequest to HabitResponse

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Habit habit = new Habit();
        habit.setUser(user);
        habit.setHabitName(request.habitName());
        habit.setHabitDescription(request.habitDescription());
        habit.setHabitTags(request.habitTags());

        Habit savedHabit = repository.save(habit);

        HabitResponse response = new HabitResponse(
                savedHabit.getHabitId(),
                savedHabit.getUser().getUserId(),
                savedHabit.getHabitName(),
                savedHabit.getHabitDescription(),
                savedHabit.getHabitTags(),
                savedHabit.getCreatedAt()
        );

        System.out.println("Habit created");

        return response;
    }

    //read Habit
    public HabitResponse getHabit(int userId, int habitId) {

        Habit habit = repository.findById(habitId)
                .orElseThrow( () -> new RuntimeException("Habit not found") );

        // Validate ownership
        if (habit.getUser().getUserId() != userId) {
            throw new RuntimeException("Unauthorized: You can only access your own habits");
        }

        return new HabitResponse(
                habit.getHabitId(),
                habit.getUser().getUserId(),
                habit.getHabitName(),
                habit.getHabitDescription(),
                habit.getHabitTags(),
                habit.getCreatedAt()
        );
    }

    //read Habits - filtered by userId
    public List<HabitResponse> getHabits(int userId) {

        return repository.findByUser_UserId(userId)
                .stream()
                .map(habit -> new HabitResponse(
                    habit.getHabitId(),
                        habit.getUser().getUserId(),
                    habit.getHabitName(),
                    habit.getHabitDescription(),
                    habit.getHabitTags(),
                    habit.getCreatedAt()
                ))
                .toList();
    }

    //update Habit
    public HabitResponse updateHabit(int userId, int habitId, HabitRequest request) {

        Habit habit = repository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        // Validate ownership
        if (habit.getUser().getUserId() != userId) {
            throw new RuntimeException("Unauthorized: You can only modify your own habits");
        }

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
                habit.getUser().getUserId(),
                updatedHabit.getHabitName(),
                updatedHabit.getHabitDescription(),
                updatedHabit.getHabitTags(),
                updatedHabit.getCreatedAt()
        );
    }

    public void deleteHabit(int userId, int habitId) {
        Habit habit = repository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        // Validate ownership
        if (habit.getUser().getUserId() != userId) {
            throw new RuntimeException("Unauthorized: You can only delete your own habits");
        }

        repository.deleteById(habitId);
        System.out.println("Habit deleted");
    }
}
