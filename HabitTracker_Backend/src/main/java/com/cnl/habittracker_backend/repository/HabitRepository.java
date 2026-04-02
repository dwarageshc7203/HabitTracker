package com.cnl.habittracker_backend.repository;

import com.cnl.habittracker_backend.model.Habit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HabitRepository extends JpaRepository<Habit, Integer> {
}
