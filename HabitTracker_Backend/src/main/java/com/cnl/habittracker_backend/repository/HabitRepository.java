package com.cnl.habittracker_backend.repository;

import com.cnl.habittracker_backend.model.Habit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HabitRepository extends JpaRepository<Habit, Integer> {
    List<Habit> findByUser_UserId(int userId);
}
