package com.docfinder.backend.service;

import com.docfinder.backend.entity.Document;
import com.docfinder.backend.entity.User;
import com.docfinder.backend.repository.DocumentRepository;
import com.docfinder.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    private final String UPLOAD_DIR = "C:/DocFinder_Project/uploads/";

    @Transactional(readOnly = true)
    public List<Document> searchByDocumentId(String documentId) {
        return documentRepository.findByDocumentIdNumber(documentId);
    }

    @Transactional(rollbackFor = Exception.class)
    public Document processAndReport(Long userId, String userName, String userPhone, MultipartFile file, String status, String documentId, String docType) throws Exception {

        String cleanDocumentId = documentId.replaceAll("\\s+", "").toUpperCase();
        String cleanPhone = userPhone != null ? userPhone.trim() : "";

        // ✅ 1. UNIQUE STRICT CONSTRAINT CHECK: Prevent the exact same user from logging the exact same Document ID twice
        List<Document> existingUserDocs = documentRepository.findByDocumentIdNumber(cleanDocumentId);
        if (existingUserDocs != null && !existingUserDocs.isEmpty()) {
            for (Document doc : existingUserDocs) {
                if (doc.getReportedBy() != null) {
                    String existingPhone = (doc.getReportedBy().getPhoneNumber() != null ? doc.getReportedBy().getPhoneNumber() : "").trim();
                    if (existingPhone.equals(cleanPhone) && doc.getStatus().equalsIgnoreCase(status)) {
                        throw new RuntimeException("Security Alert: This exact Document ID is already registered under your account timeline for this current status.");
                    }
                }
            }
        }

        User user;
        // ✅ 2. SMART LOOKUP ALGORITHM: Fix database duplicate key error for Users table
        if (userRepository.existsById(userId)) {
            user = userRepository.getReferenceById(userId);
        } else {
            // Find if a user with this phone number already exists in the database
            Optional<User> existingUser = userRepository.findAll().stream()
                    .filter(u -> cleanPhone.equals(u.getPhoneNumber()))
                    .findFirst();

            if (existingUser.isPresent()) {
                user = existingUser.get();
                System.out.println("👤 Auto-Healing: Reusing existing user context for phone: " + cleanPhone);
            } else {
                System.out.println("👤 Auto-Healing: Generating fresh user context for " + userName);
                User freshUser = new User();
                freshUser.setName(userName);
                freshUser.setPhoneNumber(cleanPhone);
                freshUser.setRole("USER");
                freshUser.setTrustScore(100);
                user = userRepository.save(freshUser);
            }
        }

        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(UPLOAD_DIR + fileName);
        if(!file.isEmpty()){
            Files.copy(file.getInputStream(), filePath);
        }

        Document document = new Document();
        document.setDocumentIdNumber(cleanDocumentId);
        document.setDocumentType(docType);
        document.setStatus(status);
        document.setImageUrl(file.isEmpty() ? "NO_IMAGE" : filePath.toString());
        document.setReportedBy(user);

        document.setFinalStatus("PENDING_MATCH");
        document.setCustodyStatus("WITH_FINDER");

        try {
            Document savedDocument = documentRepository.save(document);
            checkForMatches(savedDocument);
            return savedDocument;
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Document ID " + cleanDocumentId + " is already reported as " + status + "!");
        }
    }

    public void checkForMatches(Document newDoc) {
        String oppositeStatus = newDoc.getStatus().equals("LOST") ? "FOUND" : "LOST";
        List<Document> matches = documentRepository.findByDocumentIdNumberAndStatus(
                newDoc.getDocumentIdNumber(), oppositeStatus);

        if (matches != null && !matches.isEmpty()) {
            Document match = matches.get(0);

            newDoc.setMatchedDocumentId(match.getId());
            newDoc.setFinalStatus("MATCHED_UNVERIFIED");

            match.setMatchedDocumentId(newDoc.getId());
            match.setFinalStatus("MATCHED_UNVERIFIED");

            // ✅ FIX 1: Bidirectional Save - Dono files database me lock hongi!
            documentRepository.save(match);
            documentRepository.save(newDoc);

            System.out.println("🔗 CORRUPTION-LOCK ACTIVE: Bidirectional match established for ID: " + newDoc.getDocumentIdNumber());
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public Document verifyByPolice(Long documentId, String actionType) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if ("ACCEPT_FROM_FINDER".equalsIgnoreCase(actionType)) {
            doc.setPoliceAcceptedFromFinder(true);
        } else if ("HANDOVER_TO_LOSER".equalsIgnoreCase(actionType)) {
            doc.setPoliceHandedOverToLoser(true);
        }

        return evaluateAndSyncWorkflow(doc);
    }

    @Transactional(rollbackFor = Exception.class)
    public Document confirmByUser(Long documentId, String roleType) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if ("FINDER".equalsIgnoreCase(roleType)) {
            doc.setFinderHandedOverToPolice(true);
        } else if ("REPORTER".equalsIgnoreCase(roleType) || "LOSER".equalsIgnoreCase(roleType)) {
            doc.setLoserReceivedConfirmed(true);
        }

        return evaluateAndSyncWorkflow(doc);
    }

    private Document evaluateAndSyncWorkflow(Document doc) {
        Document pairedDoc = null;
        if (doc.getMatchedDocumentId() != null) {
            pairedDoc = documentRepository.findById(doc.getMatchedDocumentId()).orElse(null);
        }

        boolean fOut = doc.isFinderHandedOverToPolice() || (pairedDoc != null && pairedDoc.isFinderHandedOverToPolice());
        boolean pIn = doc.isPoliceAcceptedFromFinder() || (pairedDoc != null && pairedDoc.isPoliceAcceptedFromFinder());
        boolean pOut = doc.isPoliceHandedOverToLoser() || (pairedDoc != null && pairedDoc.isPoliceHandedOverToLoser());
        boolean oIn = doc.isLoserReceivedConfirmed() || (pairedDoc != null && pairedDoc.isLoserReceivedConfirmed());

        String targetCustody = "WITH_FINDER";
        String targetFinal = "PENDING_MATCH";

        if (pairedDoc != null) {
            targetFinal = "MATCHED_UNVERIFIED";
        }

        // ✅ FIX 2: Strict State Priority (Police actions override user actions instantly)
        if (pOut && oIn) {
            targetCustody = "HANDED_OVER";
            targetFinal = "COMPLETED";
        } else if (pOut && !oIn) {
            targetCustody = "WITH_LOSER";
            targetFinal = "DELIVERED_UNMARKED";
        } else if (pIn) {
            targetCustody = "IN_POLICE_STATION";
            targetFinal = "IN_POLICE_CUSTODY";
        } else if (fOut) {
            targetCustody = "IN_TRANSIT_TO_POLICE";
            if(pairedDoc != null) targetFinal = "MATCHED_UNVERIFIED";
        }

        doc.setFinderHandedOverToPolice(fOut);
        doc.setPoliceAcceptedFromFinder(pIn);
        doc.setPoliceHandedOverToLoser(pOut);
        doc.setLoserReceivedConfirmed(oIn);
        doc.setCustodyStatus(targetCustody);
        doc.setFinalStatus(targetFinal);
        Document savedDoc = documentRepository.save(doc);

        if (pairedDoc != null) {
            pairedDoc.setFinderHandedOverToPolice(fOut);
            pairedDoc.setPoliceAcceptedFromFinder(pIn);
            pairedDoc.setPoliceHandedOverToLoser(pOut);
            pairedDoc.setLoserReceivedConfirmed(oIn);
            pairedDoc.setCustodyStatus(targetCustody);
            pairedDoc.setFinalStatus(targetFinal);
            documentRepository.save(pairedDoc);
        }

        return savedDoc;
    }
}