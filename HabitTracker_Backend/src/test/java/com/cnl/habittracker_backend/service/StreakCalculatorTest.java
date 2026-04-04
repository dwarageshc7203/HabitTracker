package com.cnl.habittracker_backend.service;

import com.cnl.habittracker_backend.model.HabitLog;
import com.cnl.habittracker_backend.model.HabitLogStatus;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class StreakCalculatorTest {

    @Test
    void calculatesConsecutiveStreaks() {
        LocalDate today = LocalDate.of(2026, 4, 3);
        List<HabitLog> logs = List.of(
                log(LocalDate.of(2026, 4, 1), HabitLogStatus.DONE),
                log(LocalDate.of(2026, 4, 2), HabitLogStatus.DONE),
                log(LocalDate.of(2026, 4, 3), HabitLogStatus.DONE)
        );

        StreakCalculator.StreakSummary summary = StreakCalculator.calculate(logs, today);

        assertEquals(3, summary.currentStreak());
        assertEquals(3, summary.longestStreak());
        assertEquals(100.0, summary.completionRate());
    }

    @Test
    void handlesMissedDaysAndBackfills() {
        LocalDate today = LocalDate.of(2026, 4, 4);
        List<HabitLog> logs = List.of(
                log(LocalDate.of(2026, 4, 1), HabitLogStatus.DONE),
                log(LocalDate.of(2026, 4, 3), HabitLogStatus.MISSED),
                log(LocalDate.of(2026, 4, 4), HabitLogStatus.DONE),
                log(LocalDate.of(2026, 4, 2), HabitLogStatus.DONE)
        );

        StreakCalculator.StreakSummary summary = StreakCalculator.calculate(logs, today);

        assertEquals(1, summary.currentStreak());
        assertEquals(2, summary.longestStreak());
        assertEquals(75.0, summary.completionRate());
    }

    @Test
    void returnsZeroWhenNoLogs() {
        LocalDate today = LocalDate.of(2026, 4, 4);
        StreakCalculator.StreakSummary summary = StreakCalculator.calculate(List.of(), today);

        assertEquals(0, summary.currentStreak());
        assertEquals(0, summary.longestStreak());
        assertEquals(0.0, summary.completionRate());
    }

    private HabitLog log(LocalDate date, HabitLogStatus status) {
        HabitLog log = new HabitLog();
        log.setLogDate(date);
        log.setStatus(status);
        return log;
    }
}
