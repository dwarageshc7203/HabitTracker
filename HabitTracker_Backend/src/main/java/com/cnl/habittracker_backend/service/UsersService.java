package com.cnl.habittracker_backend.service;

import com.cnl.habittracker_backend.model.Users;
import com.cnl.habittracker_backend.model.dto.UsersRequest;
import com.cnl.habittracker_backend.model.dto.UsersResponse;
import com.cnl.habittracker_backend.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UsersService {

    @Autowired
    private UsersRepository repository;

    //create User
    public UsersResponse createUser(UsersRequest request) {
        Users user = new Users();
        user.setUserName(request.userName());
        user.setPassword(request.password());

        Users savedUser = repository.save(user);

        return new UsersResponse(
                savedUser.getUserId(),
                savedUser.getUserName(),
                savedUser.getPassword(),
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
                user.getPassword(),
                user.getStreaks(),
                user.getCreatedAt()
        );
    }
}
