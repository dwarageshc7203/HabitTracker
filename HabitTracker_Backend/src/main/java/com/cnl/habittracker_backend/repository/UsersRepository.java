package com.cnl.habittracker_backend.repository;

import com.cnl.habittracker_backend.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Integer> {
    Optional<Users> findByUserName(String userName);
    Optional<Users> findByEmail(String email);
}


