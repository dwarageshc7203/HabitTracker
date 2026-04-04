package com.cnl.habittracker_backend.service;

import com.cnl.habittracker_backend.model.HabitLog;
import com.cnl.habittracker_backend.model.HabitLogStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public final class StreakCalculator {

    private StreakCalculator() {
    }

    public static StreakSummary calculate(List<HabitLog> logs) {
        return calculate(logs, LocalDate.now());
    }

    public static StreakSummary calculate(List<HabitLog> logs, LocalDate today) {
        if (logs == null || logs.isEmpty()) {
            return new StreakSummary(0, 0, 0.0);
        }

        long totalCount = logs.size();
        long doneCount = logs.stream()
                .filter(log -> log.getStatus() == HabitLogStatus.DONE)
                .count();
        double completionRate = totalCount == 0 ? 0.0 : (doneCount * 100.0) / totalCount;

        Set<LocalDate> doneDates = logs.stream()
                .filter(log -> log.getStatus() == HabitLogStatus.DONE)
                .map(HabitLog::getLogDate)
                .collect(Collectors.toSet());

        if (doneDates.isEmpty()) {
            return new StreakSummary(0, 0, completionRate);
        }

        List<LocalDate> sortedDates = doneDates.stream()
                .sorted()
                .toList();

        int longestStreak = 1;
        int running = 1;
        LocalDate previous = sortedDates.get(0);

        for (int i = 1; i < sortedDates.size(); i++) {
            LocalDate current = sortedDates.get(i);
            if (current.equals(previous.plusDays(1))) {
                running++;
            } else {
                running = 1;
            }
            longestStreak = Math.max(longestStreak, running);
            previous = current;
        }

        int currentStreak = 0;
        LocalDate cursor = today;
        while (doneDates.contains(cursor)) {
            currentStreak++;
            cursor = cursor.minusDays(1);
        }

        return new StreakSummary(currentStreak, longestStreak, completionRate);
    }

    public record StreakSummary(int currentStreak, int longestStreak, double completionRate) {
    }
}
