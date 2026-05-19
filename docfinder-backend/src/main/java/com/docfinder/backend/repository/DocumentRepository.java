package com.docfinder.backend.repository;

import com.docfinder.backend.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    // Ye search feature ke liye zaroori hai
    List<Document> findByDocumentIdNumber(String documentIdNumber);

    // Ye matching engine (BINGO) ke liye zaroori hai
    List<Document> findByDocumentIdNumberAndStatus(String documentIdNumber, String status);
}