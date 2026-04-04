package com.cnl.habittracker_backend.service;

import com.cnl.habittracker_backend.exception.BadRequestException;
import com.cnl.habittracker_backend.exception.ConflictException;
import com.cnl.habittracker_backend.exception.NotFoundException;
import com.cnl.habittracker_backend.exception.UnauthorizedException;
import com.cnl.habittracker_backend.model.Habit;
import com.cnl.habittracker_backend.model.HabitLog;
import com.cnl.habittracker_backend.model.dto.HabitLog.HabitLogRequest;
import com.cnl.habittracker_backend.model.dto.HabitLog.HabitLogResponse;
import com.cnl.habittracker_backend.repository.HabitLogRepository;
import com.cnl.habittracker_backend.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HabitLogService {

    @Autowired
    private HabitLogRepository repository;

    @Autowired
    private HabitRepository habitRepository;

    public HabitLogResponse createLog(int userId, int habitId, HabitLogRequest request) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new NotFoundException("Habit not found"));

        if (habit.getUser().getUserId() != userId) {
            throw new UnauthorizedException("Unauthorized: You can only log for your own habits");
        }

        if (request == null || request.logDate() == null) {
            throw new BadRequestException("Log date is required");
        }

        if (request.status() == null) {
            throw new BadRequestException("Log status is required");
        }

        if (request.timezone() != null && !request.timezone().isBlank()) {
            try {
                ZoneId.of(request.timezone());
            } catch (DateTimeException ex) {
                throw new BadRequestException("Invalid timezone");
            }
        }

        if (repository.existsByHabit_HabitIdAndLogDate(habitId, request.logDate())) {
            throw new ConflictException("Log already exists for this habit and date");
        }

        HabitLog log = new HabitLog();
        log.setHabit(habit);
        log.setLogDate(request.logDate());
        log.setStatus(request.status());
        log.setTimezone(request.timezone());

        try {
            HabitLog saved = repository.save(log);
            return mapToResponse(saved);
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("Log already exists for this habit and date");
        }
    }

    public List<HabitLogResponse> getLogs(int userId, int habitId, LocalDate from, LocalDate to) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new NotFoundException("Habit not found"));

        if (habit.getUser().getUserId() != userId) {
            throw new UnauthorizedException("Unauthorized: You can only view logs for your own habits");
        }

        List<HabitLog> logs;
        if (from == null && to == null) {
            logs = repository.findByHabit_HabitIdOrderByLogDateAsc(habitId);
        } else {
            LocalDate fromDate = from == null ? LocalDate.of(1970, 1, 1) : from;
            LocalDate toDate = to == null ? LocalDate.now() : to;
            if (fromDate.isAfter(toDate)) {
                throw new BadRequestException("from must be on or before to");
            }
            logs = repository.findByHabit_HabitIdAndLogDateBetweenOrderByLogDateAsc(
                    habitId,
                    fromDate,
                    toDate
            );
        }

        return logs.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private HabitLogResponse mapToResponse(HabitLog log) {
        return new HabitLogResponse(
                log.getLogId(),
                log.getHabit().getHabitId(),
                log.getLogDate(),
                log.getStatus(),
                log.getTimezone(),
                log.getCreatedAt()
        );
    }
}
