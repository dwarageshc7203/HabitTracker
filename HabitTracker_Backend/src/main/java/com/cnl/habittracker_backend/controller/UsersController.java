package com.cnl.habittracker_backend.controller;

import com.cnl.habittracker_backend.model.dto.UsersRequest;
import com.cnl.habittracker_backend.model.dto.UsersResponse;
import com.cnl.habittracker_backend.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class UsersController {

    @Autowired
    private UsersService service;

    //create User
    @PostMapping("/users")
    public ResponseEntity<UsersResponse> createUser(@RequestBody UsersRequest request) {
        return new ResponseEntity<>(service.createUser(request), HttpStatus.OK);
    }

    //get User
    @GetMapping("/users/{userId}")
    public ResponseEntity<UsersResponse> getUser(@PathVariable int userId) {
        return new ResponseEntity<>(service.getUser(userId), HttpStatus.OK);
    }


    //getUsers


}
