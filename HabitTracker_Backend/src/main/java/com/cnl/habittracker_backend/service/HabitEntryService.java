package com.cnl.habittracker_backend.service;

import com.cnl.habittracker_backend.model.Habit;
import com.cnl.habittracker_backend.model.HabitEntry;
import com.cnl.habittracker_backend.model.Users;
import com.cnl.habittracker_backend.model.dto.HabitEntry.HabitEntryRequest;
import com.cnl.habittracker_backend.model.dto.HabitEntry.HabitEntryResponse;
import com.cnl.habittracker_backend.repository.HabitEntryRepository;
import com.cnl.habittracker_backend.repository.HabitRepository;
import com.cnl.habittracker_backend.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HabitEntryService {

    @Autowired
    private HabitEntryRepository repository;

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private UsersRepository usersRepository;


    public HabitEntryResponse createEntry(int userId, HabitEntryRequest request) {
        Habit habit = habitRepository.findById(request.habitId())
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate that the habit belongs to the user
        if (habit.getUser().getUserId() != userId) {
            throw new RuntimeException("Unauthorized: You can only log entries for your own habits");
        }

        HabitEntry entry = new HabitEntry();
        entry.setHabit(habit);
        entry.setUser(user);
        entry.setEntryStatus(request.entryStatus());
        entry.setCompletedAt(request.completedAt());

        HabitEntry saved = repository.save(entry);
        return mapToResponse(saved);
    }

    // Get history for a habit - validate user owns the habit
    public List<HabitEntryResponse> getEntryHistory(int userId, int habitId) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        // Validate ownership
        if (habit.getUser().getUserId() != userId) {
            throw new RuntimeException("Unauthorized: You can only view entries for your own habits");
        }

        return repository.findByHabit_HabitId(habitId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get today's entries for a user
    public List<HabitEntryResponse> getEntries(int userId) {
        return repository.findByUser_UserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Helper to convert Entity → Response
    private HabitEntryResponse mapToResponse(HabitEntry entry) {
        return new HabitEntryResponse(
                entry.getEntryId(),
                entry.getUser().getUserId(),
                entry.getHabit().getHabitId(),
                entry.getEntryStatus(),
                entry.getCompletedAt()
        );
    }

}
