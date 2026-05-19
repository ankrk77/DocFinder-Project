package com.docfinder.backend.dto;


public class AiResponseDTO {
    // Ab hum production-ready generic naam use kar rahe hain
    private String document_id;
    private String cert_no;
    private String doc_type;

    // Getters
    public String getDocument_id() { return document_id; }
    public String getCert_no() { return cert_no; }
    public String getDoc_type() { return doc_type; }

    // Setters
    public void setDocument_id(String document_id) { this.document_id = document_id; }
    public void setCert_no(String cert_no) { this.cert_no = cert_no; }
    public void setDoc_type(String doc_type) { this.doc_type = doc_type; }
}