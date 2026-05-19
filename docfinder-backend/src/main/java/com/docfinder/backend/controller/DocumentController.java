package com.docfinder.backend.controller;

import com.docfinder.backend.dto.AiResponseDTO;
import com.docfinder.backend.entity.Document;
import com.docfinder.backend.service.AiVisionService;
import com.docfinder.backend.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private AiVisionService aiVisionService;

    @Autowired
    private com.docfinder.backend.repository.DocumentRepository documentRepository;

    @PostMapping("/extract")
    public ResponseEntity<?> extractDocumentData(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body("File is empty!");
        try {
            System.out.println("📥 AI Extraction request hitting backend for: " + file.getOriginalFilename());
            AiResponseDTO extractedData = aiVisionService.extractDataFromImage(file);
            return ResponseEntity.ok(extractedData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("AI Error: " + e.getMessage());
        }
    }

    @PostMapping("/report")
    public ResponseEntity<?> report(
            @RequestParam("userId") Long userId,
            @RequestParam(value = "userName", defaultValue = "Verified Citizen") String userName,
            @RequestParam(value = "userPhone", defaultValue = "0000000000") String userPhone,
            @RequestParam("file") MultipartFile file,
            @RequestParam("status") String status,
            @RequestParam("documentId") String documentId,
            @RequestParam("docType") String docType) {

        // Sirf FOUND document walon ke liye image upload zaroori hai.
        if ("FOUND".equalsIgnoreCase(status) && file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please upload a file!");
        }

        try {
            String cleanDocumentId = documentId.replaceAll("\\s+", "").toUpperCase();
            // Passing real name and phone to service
            Document savedDoc = documentService.processAndReport(userId, userName, userPhone, file, status, cleanDocumentId, docType);
            return ResponseEntity.ok(savedDoc);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Database Error: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchDocument(@RequestParam("documentId") String documentId) {
        try {
            String cleanId = documentId.replaceAll("\\s+", "").toUpperCase();
            List<Document> results = documentService.searchByDocumentId(cleanId);

            if (results.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No document found with ID: " + documentId);
            }

            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Search Error: " + e.getMessage());
        }
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmHandover(
            @RequestParam("documentId") Long documentId,
            @RequestParam("roleType") String roleType) {
        try {
            Document updatedDoc = documentService.confirmByUser(documentId, roleType);
            return ResponseEntity.ok(updatedDoc);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Confirmation Error: " + e.getMessage());
        }
    }

    @PostMapping("/admin/verify")
    public ResponseEntity<?> verifyByPolice(
            @RequestParam("documentId") Long documentId,
            @RequestParam("actionType") String actionType) {
        try {
            Document updatedDoc = documentService.verifyByPolice(documentId, actionType);
            return ResponseEntity.ok(updatedDoc);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Verification Error: " + e.getMessage());
        }
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllDocuments() {
        try {
            return ResponseEntity.ok(documentRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching all documents: " + e.getMessage());
        }
    }
}