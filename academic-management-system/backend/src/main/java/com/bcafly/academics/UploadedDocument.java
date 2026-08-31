package com.bcafly.academics;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "uploaded_documents")
public class UploadedDocument {
    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "semester_id", nullable = false)
    private Integer semesterId;

    @Column(name = "academic_year_id", nullable = false, length = 50)
    private String academicYearId;

    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    @Column(name = "file_type", nullable = false, length = 10)
    private String fileType;

    @Column(name = "storage_url", nullable = false, length = 500)
    private String storageUrl;

    @Column(name = "uploaded_by", nullable = false, length = 100)
    private String uploadedBy;

    @Column(name = "uploaded_at", nullable = false)
    private Instant uploadedAt = Instant.now();

    @Column(name = "import_status", nullable = false, length = 20)
    private String importStatus = "pending";

    public UploadedDocument() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Integer getSemesterId() { return semesterId; }
    public void setSemesterId(Integer semesterId) { this.semesterId = semesterId; }
    public String getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(String academicYearId) { this.academicYearId = academicYearId; }
    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public String getStorageUrl() { return storageUrl; }
    public void setStorageUrl(String storageUrl) { this.storageUrl = storageUrl; }
    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
    public Instant getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Instant uploadedAt) { this.uploadedAt = uploadedAt; }
    public String getImportStatus() { return importStatus; }
    public void setImportStatus(String importStatus) { this.importStatus = importStatus; }
}
