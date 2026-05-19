package com.docfinder.backend.service;

import com.docfinder.backend.dto.AiResponseDTO;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AiVisionService {

    // Python AI Server ka URL (Make sure Python port 8000 par chal raha ho)
    private final String PYTHON_API_URL = "http://localhost:8000/extract-data";

    public AiResponseDTO extractDataFromImage(MultipartFile file) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            // 1. Headers set karna (kyunki image file bhej rahe hain)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // 2. Body mein file attach karna (Jaise Postman mein karte hain)
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());

            // 3. Request ko pack karna
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 4. Python API ko POST request bhejna
            ResponseEntity<AiResponseDTO> response = restTemplate.exchange(
                    PYTHON_API_URL,
                    HttpMethod.POST,
                    requestEntity,
                    AiResponseDTO.class
            );

            return response.getBody();

        } catch (Exception e) {
            System.out.println("Python Engine Connection Error: " + e.getMessage());
            // Agar koi error aaye toh Java crash na ho
            AiResponseDTO errorResponse = new AiResponseDTO();
            errorResponse.setDoc_type("ERROR");
            errorResponse.setDocument_id("NOT_FOUND");
            errorResponse.setCert_no("NOT_FOUND");
            return errorResponse;
        }
    }
}