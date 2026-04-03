package com.cnl.habittracker_backend.service;

import com.cnl.habittracker_backend.model.Users;
import com.cnl.habittracker_backend.model.dto.Users.UsersRequest;
import com.cnl.habittracker_backend.model.dto.Users.UsersResponse;
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

    //update User
    public UsersResponse updateUser(int userId, UsersRequest request) {
        Users user = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(request.userName() != null) {
            user.setUserName(request.userName());
        }
        if(request.password() != null) {
            user.setPassword(request.password());
        }

        Users updatedUser = repository.save(user);

        return new UsersResponse(
                updatedUser.getUserId(),
                updatedUser.getUserName(),
                updatedUser.getPassword(),
                updatedUser.getStreaks(),
                updatedUser.getCreatedAt()
        );
    }

    //delete User
    public void deleteUser(int userId) {
        repository.deleteById(userId);
        System.out.println("User deleted");

    }
}
