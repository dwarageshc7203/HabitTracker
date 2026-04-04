package com.cnl.habittracker_backend.service;

import com.cnl.habittracker_backend.exception.BadRequestException;
import com.cnl.habittracker_backend.exception.NotFoundException;
import com.cnl.habittracker_backend.exception.UnauthorizedException;
import com.cnl.habittracker_backend.model.Habit;
import com.cnl.habittracker_backend.model.Users;
import com.cnl.habittracker_backend.model.dto.Habit.HabitRequest;
import com.cnl.habittracker_backend.model.dto.Habit.HabitResponse;
import com.cnl.habittracker_backend.repository.HabitLogRepository;
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
    private HabitLogRepository habitLogRepository;

    @Autowired
    private UsersRepository usersRepository;

    //create Habit
    public HabitResponse createHabit(int userId, HabitRequest request) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        validateHabitRequest(request);

        Habit habit = new Habit();
        habit.setUser(user);
        habit.setHabitName(request.habitName());
        habit.setHabitCategory(request.habitCategory());
        habit.setHabitDifficulty(request.habitDifficulty());

        Habit savedHabit = repository.save(habit);
        StreakCalculator.StreakSummary streakSummary = new StreakCalculator.StreakSummary(0, 0, 0.0);

        HabitResponse response = new HabitResponse(
                savedHabit.getHabitId(),
                savedHabit.getUser().getUserId(),
                savedHabit.getHabitName(),
                savedHabit.getHabitCategory(),
                savedHabit.getHabitDifficulty(),
                savedHabit.getCreatedAt(),
                streakSummary.currentStreak(),
                streakSummary.longestStreak(),
                streakSummary.completionRate()
        );

        System.out.println("Habit created");

        return response;
    }

    //read Habit
    public HabitResponse getHabit(int userId, int habitId) {

        Habit habit = repository.findById(habitId)
            .orElseThrow(() -> new NotFoundException("Habit not found"));

        // Validate ownership
        if (habit.getUser().getUserId() != userId) {
            throw new UnauthorizedException("Unauthorized: You can only access your own habits");
        }

        StreakCalculator.StreakSummary streakSummary = StreakCalculator.calculate(
            habitLogRepository.findByHabit_HabitIdOrderByLogDateAsc(habitId)
        );

        return new HabitResponse(
                habit.getHabitId(),
                habit.getUser().getUserId(),
                habit.getHabitName(),
            habit.getHabitCategory(),
            habit.getHabitDifficulty(),
            habit.getCreatedAt(),
            streakSummary.currentStreak(),
                streakSummary.longestStreak(),
                streakSummary.completionRate()
        );
    }

    //read Habits - filtered by userId
    public List<HabitResponse> getHabits(int userId) {
        return repository.findByUser_UserId(userId)
                .stream()
                .map(habit -> {
                    StreakCalculator.StreakSummary streakSummary = StreakCalculator.calculate(
                            habitLogRepository.findByHabit_HabitIdOrderByLogDateAsc(habit.getHabitId())
                    );

                    return new HabitResponse(
                            habit.getHabitId(),
                            habit.getUser().getUserId(),
                            habit.getHabitName(),
                            habit.getHabitCategory(),
                            habit.getHabitDifficulty(),
                            habit.getCreatedAt(),
                            streakSummary.currentStreak(),
                            streakSummary.longestStreak(),
                            streakSummary.completionRate()
                    );
                })
                .toList();
    }

    //update Habit
    public HabitResponse updateHabit(int userId, int habitId, HabitRequest request) {

        Habit habit = repository.findById(habitId)
                .orElseThrow(() -> new NotFoundException("Habit not found"));

        // Validate ownership
        if (habit.getUser().getUserId() != userId) {
            throw new UnauthorizedException("Unauthorized: You can only modify your own habits");
        }

        validateHabitRequest(request);

        if (request.habitName() != null) {
            habit.setHabitName(request.habitName());
        }
        if (request.habitCategory() != null) {
            habit.setHabitCategory(request.habitCategory());
        }
        if (request.habitDifficulty() != null) {
            habit.setHabitDifficulty(request.habitDifficulty());
        }

        Habit updatedHabit = repository.save(habit);
        StreakCalculator.StreakSummary streakSummary = StreakCalculator.calculate(
                habitLogRepository.findByHabit_HabitIdOrderByLogDateAsc(habitId)
        );

        System.out.println("Habit updated");

        return new HabitResponse(
                updatedHabit.getHabitId(),
                habit.getUser().getUserId(),
                updatedHabit.getHabitName(),
                updatedHabit.getHabitCategory(),
                updatedHabit.getHabitDifficulty(),
                updatedHabit.getCreatedAt(),
                streakSummary.currentStreak(),
                streakSummary.longestStreak(),
                streakSummary.completionRate()
        );
    }

    public void deleteHabit(int userId, int habitId) {
        Habit habit = repository.findById(habitId)
            .orElseThrow(() -> new NotFoundException("Habit not found"));

        // Validate ownership
        if (habit.getUser().getUserId() != userId) {
            throw new UnauthorizedException("Unauthorized: You can only delete your own habits");
        }

        repository.deleteById(habitId);
        System.out.println("Habit deleted");
    }

    private void validateHabitRequest(HabitRequest request) {
        if (request == null) {
            throw new BadRequestException("Habit request is required");
        }
        if (request.habitName() == null || request.habitName().isBlank()) {
            throw new BadRequestException("Habit name is required");
        }
        if (request.habitCategory() == null || request.habitCategory().isBlank()) {
            throw new BadRequestException("Habit category is required");
        }
        if (request.habitDifficulty() == null) {
            throw new BadRequestException("Habit difficulty is required");
        }
    }
}
