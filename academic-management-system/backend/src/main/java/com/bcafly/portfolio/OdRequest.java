package com.bcafly.portfolio;

import com.bcafly.students.StudentProfile;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "od_requests")
public class OdRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "submission_id", nullable = false)
    private StudentEventSubmission submission;

    @Column(nullable = false)
    private LocalDate requestedDate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(nullable = false, length = 20)
    private String facultyStatus = "PENDING";

    @Column(nullable = false, length = 20)
    private String hodStatus = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String approvalNotes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public OdRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public StudentProfile getStudent() { return student; }
    public void setStudent(StudentProfile student) { this.student = student; }
    public StudentEventSubmission getSubmission() { return submission; }
    public void setSubmission(StudentEventSubmission submission) { this.submission = submission; }
    public LocalDate getRequestedDate() { return requestedDate; }
    public void setRequestedDate(LocalDate requestedDate) { this.requestedDate = requestedDate; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getFacultyStatus() { return facultyStatus; }
    public void setFacultyStatus(String facultyStatus) { this.facultyStatus = facultyStatus; }
    public String getHodStatus() { return hodStatus; }
    public void setHodStatus(String hodStatus) { this.hodStatus = hodStatus; }
    public String getApprovalNotes() { return approvalNotes; }
    public void setApprovalNotes(String approvalNotes) { this.approvalNotes = approvalNotes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
