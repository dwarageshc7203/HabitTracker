package com.cnl.habittracker_backend.service;

import com.cnl.habittracker_backend.model.Users;
import com.cnl.habittracker_backend.model.dto.Users.UsersRequest;
import com.cnl.habittracker_backend.model.dto.Users.UsersResponse;
import com.cnl.habittracker_backend.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsersService {

    @Autowired
    private UsersRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    //create User
    public UsersResponse createUser(UsersRequest request) {
        Users user = new Users();
        String userName = request.userName();
        if (userName == null || userName.isBlank()) {
            userName = request.email();
        }
        user.setUserName(userName);
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setDateOfBirth(request.dateOfBirth());
        user.setProfilePhotoUrl(request.profilePhotoUrl());
        user.setEndGoal(request.endGoal());

        Users savedUser = repository.save(user);

        return new UsersResponse(
                savedUser.getUserId(),
                savedUser.getUserName(),
                savedUser.getEmail(),
                savedUser.getDateOfBirth(),
                savedUser.getProfilePhotoUrl(),
                savedUser.getEndGoal(),
                savedUser.getStreaks(),
                savedUser.getCreatedAt()
        );
    }

    //get User
    public UsersResponse getUser(int userId) {

        Users user = repository.findById(userId)
                .orElseThrow( () -> new RuntimeException("User not found"));

        return new UsersResponse(
                user.getUserId(),
                user.getUserName(),
                user.getEmail(),
                user.getDateOfBirth(),
                user.getProfilePhotoUrl(),
                user.getEndGoal(),
                user.getStreaks(),
                user.getCreatedAt()
        );
    }

    //authenticate User (for login)
    public Users authenticateUser(String email, String password) {
        Users user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }

    //update User
    public UsersResponse updateUser(int userId, UsersRequest request) {
        Users user = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(request.userName() != null) {
            user.setUserName(request.userName());
        }
        if(request.email() != null) {
            user.setEmail(request.email());
        }
        if(request.password() != null) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        if(request.dateOfBirth() != null) {
            user.setDateOfBirth(request.dateOfBirth());
        }
        if(request.profilePhotoUrl() != null) {
            user.setProfilePhotoUrl(request.profilePhotoUrl());
        }
        if(request.endGoal() != null) {
            user.setEndGoal(request.endGoal());
        }

        Users updatedUser = repository.save(user);

        return new UsersResponse(
                updatedUser.getUserId(),
                updatedUser.getUserName(),
                updatedUser.getEmail(),
                updatedUser.getDateOfBirth(),
                updatedUser.getProfilePhotoUrl(),
                updatedUser.getEndGoal(),
                updatedUser.getStreaks(),
                updatedUser.getCreatedAt()
        );
    }

    //update Password
    public void updatePassword(int userId, String currentPassword, String newPassword) {
        Users user = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Invalid current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        repository.save(user);
    }

    //delete User
    public void deleteUser(int userId) {
        repository.deleteById(userId);
        System.out.println("User deleted");

    }
}


