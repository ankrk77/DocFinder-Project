package com.docfinder.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String documentIdNumber;

    private String documentType;

    private String status; // 'LOST' ya 'FOUND'

    private String imageUrl; // Sirf FOUND ke case mein upload hogi

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User reportedBy;

    // ==========================================
    // ANTI-CORRUPTION MULTI-PARTY PROTOCOL FLAGS
    // ==========================================
    private Boolean finderHandedOverToPolice = false; // Finder ne bola ki thane mein de diya
    private Boolean policeAcceptedFromFinder = false; // Police ne accept kiya ki thane mein aa gaya
    private Boolean policeHandedOverToLoser = false;  // Police ne bola ki maalik ko de diya
    private Boolean loserReceivedConfirmed = false;   // Loser/Owner ne bola ki mujhe safe mil gaya

    // Workflow State: PENDING_MATCH -> MATCHED_UNVERIFIED -> IN_POLICE_CUSTODY -> DELIVERED_UNMARKED -> COMPLETED
    private String finalStatus = "PENDING_MATCH";

    // Physical Location Track: WITH_FINDER -> IN_TRANSIT_TO_POLICE -> IN_POLICE_STATION -> HANDED_OVER
    private String custodyStatus = "WITH_FINDER";

    // DB Linkage for Matches: Agar match hua toh doosre related document ki ID yahan store hogi
    private Long matchedDocumentId;

    // ==========================================
    // ALL GETTERS AND SETTERS
    // ==========================================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDocumentIdNumber() { return documentIdNumber; }
    public void setDocumentIdNumber(String documentIdNumber) { this.documentIdNumber = documentIdNumber; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public User getReportedBy() { return reportedBy; }
    public void setReportedBy(User reportedBy) { this.reportedBy = reportedBy; }

    public String getFinalStatus() { return finalStatus; }
    public void setFinalStatus(String finalStatus) { this.finalStatus = finalStatus; }

    public String getCustodyStatus() { return custodyStatus; }
    public void setCustodyStatus(String custodyStatus) { this.custodyStatus = custodyStatus; }

    public Long getMatchedDocumentId() { return matchedDocumentId; }
    public void setMatchedDocumentId(Long matchedDocumentId) { this.matchedDocumentId = matchedDocumentId; }

    // ==========================================
    // SMART NULL-SAFE GETTERS & SETTERS FOR FLAGS
    // ==========================================

    public boolean isFinderHandedOverToPolice() {
        return finderHandedOverToPolice != null && finderHandedOverToPolice;
    }
    public void setFinderHandedOverToPolice(Boolean finderHandedOverToPolice) {
        this.finderHandedOverToPolice = finderHandedOverToPolice;
    }

    public boolean isPoliceAcceptedFromFinder() {
        return policeAcceptedFromFinder != null && policeAcceptedFromFinder;
    }
    public void setPoliceAcceptedFromFinder(Boolean policeAcceptedFromFinder) {
        this.policeAcceptedFromFinder = policeAcceptedFromFinder;
    }

    public boolean isPoliceHandedOverToLoser() {
        return policeHandedOverToLoser != null && policeHandedOverToLoser;
    }
    public void setPoliceHandedOverToLoser(Boolean policeHandedOverToLoser) {
        this.policeHandedOverToLoser = policeHandedOverToLoser;
    }

    public boolean isLoserReceivedConfirmed() {
        return loserReceivedConfirmed != null && loserReceivedConfirmed;
    }
    public void setLoserReceivedConfirmed(Boolean loserReceivedConfirmed) {
        this.loserReceivedConfirmed = loserReceivedConfirmed;
    }
}