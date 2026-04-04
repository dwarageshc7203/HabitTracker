package com.cnl.habittracker_backend.repository;

import com.cnl.habittracker_backend.model.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitLogRepository extends JpaRepository<HabitLog, Integer> {
    boolean existsByHabit_HabitIdAndLogDate(int habitId, LocalDate logDate);

    Optional<HabitLog> findByHabit_HabitIdAndLogDate(int habitId, LocalDate logDate);

    List<HabitLog> findByHabit_HabitIdOrderByLogDateAsc(int habitId);

    List<HabitLog> findByHabit_HabitIdAndLogDateBetweenOrderByLogDateAsc(
            int habitId,
            LocalDate from,
            LocalDate to
    );
}
