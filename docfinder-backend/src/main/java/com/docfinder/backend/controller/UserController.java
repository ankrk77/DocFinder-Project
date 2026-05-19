package com.docfinder.backend.controller;

import com.docfinder.backend.entity.User;
import com.docfinder.backend.service.OtpService;
import com.docfinder.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private OtpService otpService;

    // API 1: User OTP mangeaga
    @PostMapping("/request-otp")
    public ResponseEntity<String> requestOtp(@RequestParam String phoneNumber) {
        otpService.generateAndSendOtp(phoneNumber);
        return ResponseEntity.ok("OTP successfully sent to " + phoneNumber);
    }


    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(
            @RequestParam String phoneNumber,
            @RequestParam String otp,
            @RequestParam String role) {


        boolean isOtpValid = otpService.validateOtp(phoneNumber, otp);

        if (isOtpValid) {
            try {

                userService.registerUser(phoneNumber, role);
                return ResponseEntity.ok("Success: New User Registered and Logged In!");
            } catch (RuntimeException e) {

                return ResponseEntity.ok("Success: Old User Logged In!");
            }
        } else {
            return ResponseEntity.badRequest().body("Error: Invalid or Expired OTP!");
        }
    }
}