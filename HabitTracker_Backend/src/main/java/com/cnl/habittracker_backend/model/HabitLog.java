package com.cnl.habittracker_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Data
@Table(
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_habit_log_date", columnNames = {"habit_id", "log_date"})
    }
)
public class HabitLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int logId;

    @ManyToOne
    @JoinColumn(name = "habit_id", nullable = false)
    private Habit habit;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HabitLogStatus status;

    private String timezone;

    @CreationTimestamp
    private Instant createdAt;
}
