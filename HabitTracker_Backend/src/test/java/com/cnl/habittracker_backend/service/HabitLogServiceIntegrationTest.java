package com.cnl.habittracker_backend.service;

import com.cnl.habittracker_backend.exception.ConflictException;
import com.cnl.habittracker_backend.model.Habit;
import com.cnl.habittracker_backend.model.HabitDifficulty;
import com.cnl.habittracker_backend.model.HabitLogStatus;
import com.cnl.habittracker_backend.model.Users;
import com.cnl.habittracker_backend.model.dto.HabitLog.HabitLogRequest;
import com.cnl.habittracker_backend.repository.HabitRepository;
import com.cnl.habittracker_backend.repository.UsersRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class HabitLogServiceIntegrationTest {

    @Autowired
    private HabitLogService habitLogService;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private HabitRepository habitRepository;

    @Test
    void createLogPreventsDuplicate() {
        Users user = createUser("alex");
        Habit habit = createHabit(user, "Read", "Study", HabitDifficulty.EASY);
        LocalDate logDate = LocalDate.of(2026, 4, 2);

        habitLogService.createLog(user.getUserId(), habit.getHabitId(),
                new HabitLogRequest(logDate, HabitLogStatus.DONE, "America/Chicago"));

        assertThrows(ConflictException.class, () ->
                habitLogService.createLog(user.getUserId(), habit.getHabitId(),
                        new HabitLogRequest(logDate, HabitLogStatus.DONE, "America/Chicago"))
        );
    }

    @Test
    void getLogsRespectsDateRange() {
        Users user = createUser("maria");
        Habit habit = createHabit(user, "Run", "Fitness", HabitDifficulty.MEDIUM);

        habitLogService.createLog(user.getUserId(), habit.getHabitId(),
                new HabitLogRequest(LocalDate.of(2026, 4, 1), HabitLogStatus.DONE, "UTC"));
        habitLogService.createLog(user.getUserId(), habit.getHabitId(),
                new HabitLogRequest(LocalDate.of(2026, 4, 2), HabitLogStatus.MISSED, "UTC"));
        habitLogService.createLog(user.getUserId(), habit.getHabitId(),
                new HabitLogRequest(LocalDate.of(2026, 4, 3), HabitLogStatus.DONE, "UTC"));

        List<?> logs = habitLogService.getLogs(
                user.getUserId(),
                habit.getHabitId(),
                LocalDate.of(2026, 4, 2),
                LocalDate.of(2026, 4, 3)
        );

        assertEquals(2, logs.size());
    }

    private Users createUser(String userName) {
        Users user = new Users();
        user.setUserName(userName);
        user.setEmail(userName + "@example.com");
        user.setPassword("secret");
        return usersRepository.save(user);
    }

    private Habit createHabit(Users user, String name, String category, HabitDifficulty difficulty) {
        Habit habit = new Habit();
        habit.setUser(user);
        habit.setHabitName(name);
        habit.setHabitCategory(category);
        habit.setHabitDifficulty(difficulty);
        return habitRepository.save(habit);
    }
}
