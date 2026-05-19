package com.docfinder.backend.service;

import com.docfinder.backend.entity.User;
import com.docfinder.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(String phoneNumber, String role) {

        Optional<User> existingUser = userRepository.findByPhoneNumber(phoneNumber);
        if (existingUser.isPresent()) {
            throw new RuntimeException("User with this phone number already exists!");
        }

        User newUser = new User();
        newUser.setPhoneNumber(phoneNumber);
        newUser.setRole(role);
        newUser.setTrustScore(100);

        return userRepository.save(newUser);
    }
}