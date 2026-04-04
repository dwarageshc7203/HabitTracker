package com.cnl.habittracker_backend.repository;

import com.cnl.habittracker_backend.model.HabitEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HabitEntryRepository extends JpaRepository<HabitEntry, Integer> {

    List<HabitEntry> findByHabit_HabitId(int habitId);
    List<HabitEntry> findByUser_UserId(int userId);
}
