package com.bcafly.portfolio;

import com.bcafly.academics.Semester;
import com.bcafly.faculty.FacultyProfile;
import com.bcafly.students.StudentProfile;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_event_submissions")
public class StudentEventSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String submissionCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @Column(nullable = false, length = 200)
    private String eventName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private EventCategory category;

    @Column(nullable = false, length = 150)
    private String organizer;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, length = 20)
    private String mode = "OFFLINE";

    private String venueOrUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String skillsSummary;

    private String workingDayStatus = "WORKING_DAY";

    @Column(nullable = false, length = 30)
    private String verificationStatus = "SUBMITTED";

    @Column(columnDefinition = "TEXT")
    private String facultyRemarks;

    @Column(columnDefinition = "TEXT")
    private String hodRemarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private FacultyProfile verifiedBy;

    private LocalDateTime verifiedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public StudentEventSubmission() {}

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSubmissionCode() { return submissionCode; }
    public void setSubmissionCode(String submissionCode) { this.submissionCode = submissionCode; }
    public StudentProfile getStudent() { return student; }
    public void setStudent(StudentProfile student) { this.student = student; }
    public Semester getSemester() { return semester; }
    public void setSemester(Semester semester) { this.semester = semester; }
    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }
    public EventCategory getCategory() { return category; }
    public void setCategory(EventCategory category) { this.category = category; }
    public String getOrganizer() { return organizer; }
    public void setOrganizer(String organizer) { this.organizer = organizer; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public String getVenueOrUrl() { return venueOrUrl; }
    public void setVenueOrUrl(String venueOrUrl) { this.venueOrUrl = venueOrUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSkillsSummary() { return skillsSummary; }
    public void setSkillsSummary(String skillsSummary) { this.skillsSummary = skillsSummary; }
    public String getWorkingDayStatus() { return workingDayStatus; }
    public void setWorkingDayStatus(String workingDayStatus) { this.workingDayStatus = workingDayStatus; }
    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
    public String getFacultyRemarks() { return facultyRemarks; }
    public void setFacultyRemarks(String facultyRemarks) { this.facultyRemarks = facultyRemarks; }
    public String getHodRemarks() { return hodRemarks; }
    public void setHodRemarks(String hodRemarks) { this.hodRemarks = hodRemarks; }
    public FacultyProfile getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(FacultyProfile verifiedBy) { this.verifiedBy = verifiedBy; }
    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
