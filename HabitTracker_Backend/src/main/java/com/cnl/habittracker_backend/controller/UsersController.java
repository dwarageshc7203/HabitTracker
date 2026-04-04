package com.cnl.habittracker_backend.controller;

import com.cnl.habittracker_backend.model.dto.Users.PasswordUpdateRequest;
import com.cnl.habittracker_backend.model.dto.Users.UsersRequest;
import com.cnl.habittracker_backend.model.dto.Users.UsersResponse;
import com.cnl.habittracker_backend.service.UsersService;
import com.cnl.habittracker_backend.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class UsersController {

    @Autowired
    private UsersService service;

    @Autowired
    private SecurityUtil securityUtil;

    // Get own profile
    @GetMapping("/user")
    public ResponseEntity<UsersResponse> getUser(@RequestHeader("Authorization") String token) {
        int userId = securityUtil.extractUserIdFromToken(token);
        return new ResponseEntity<>(service.getUser(userId), HttpStatus.OK);
    }

    // Update own profile
    @PutMapping("/user")
    public ResponseEntity<UsersResponse> updateUser(
            @RequestHeader("Authorization") String token,
            @RequestBody UsersRequest request) {
        int userId = securityUtil.extractUserIdFromToken(token);
        return new ResponseEntity<>(service.updateUser(userId, request), HttpStatus.OK);
    }

    // Delete own account
    @DeleteMapping("/user")
    public ResponseEntity<Void> deleteUser(@RequestHeader("Authorization") String token) {
        int userId = securityUtil.extractUserIdFromToken(token);
        service.deleteUser(userId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    // Update password
    @PutMapping("/user/password")
    public ResponseEntity<Void> updatePassword(
            @RequestHeader("Authorization") String token,
            @RequestBody PasswordUpdateRequest request) {
        int userId = securityUtil.extractUserIdFromToken(token);
        service.updatePassword(userId, request.currentPassword(), request.newPassword());
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
