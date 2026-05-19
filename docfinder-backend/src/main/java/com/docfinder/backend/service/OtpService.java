package com.docfinder.backend.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static class OtpData {
        String otp;
        long expiryTime;

        OtpData(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }

    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    public void generateAndSendOtp(String phoneNumber) {
        // LAYER A: Input Validation (Phone number 10 digit ka hona chahiye)
        if (phoneNumber == null || phoneNumber.length() != 10) {
            throw new RuntimeException("Invalid Phone Number!");
        }

        int otp = 100000 + secureRandom.nextInt(900000);
        String otpString = String.valueOf(otp);
        long expiryTime = System.currentTimeMillis() + (5 * 60 * 1000);

        otpStore.put(phoneNumber, new OtpData(otpString, expiryTime));

        System.out.println("📱 SMS SIMULATION: OTP for " + phoneNumber + " is [ " + otpString + " ]");
    }

    public boolean validateOtp(String phoneNumber, String inputOtp) {
        if (!otpStore.containsKey(phoneNumber)) return false;

        OtpData savedOtpData = otpStore.get(phoneNumber);

        if (System.currentTimeMillis() > savedOtpData.expiryTime) {
            otpStore.remove(phoneNumber);
            return false;
        }

        if (savedOtpData.otp.equals(inputOtp)) {
            otpStore.remove(phoneNumber);
            return true;
        }
        return false;
    }

    // LAYER C: AUTOMATIC CLEANUP (Har 10 minute me kachra saaf karega)
    // Iske liye aapko DocfinderBackendApplication me @EnableScheduling likhna hoga
    @Scheduled(fixedRate = 600000)
    public void cleanExpiredOtps() {
        long currentTime = System.currentTimeMillis();
        // Jo OTP expire ho chuke hain, unhe memory se nikaal do taaki server crash na ho
        otpStore.entrySet().removeIf(entry -> currentTime > entry.getValue().expiryTime);
        System.out.println("🧹 Cleanup Task: Expired OTPs removed from memory.");
    }
}