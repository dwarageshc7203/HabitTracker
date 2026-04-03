package com.cnl.habittracker_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Data
public class HabitEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int entryId;

    @ManyToOne
    @JoinColumn(name = "user_id" , nullable = false)
    private Users user;

    @ManyToOne
    @JoinColumn(name = "habit_id" , nullable = false)
    private Habit habit;

    private String entryStatus;

    @CreationTimestamp
    private Instant completedAt;


}

