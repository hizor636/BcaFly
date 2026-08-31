package com.bcafly.academics;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "subjects")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false)
    private Integer credits = 4;

    @Column(nullable = false)
    private Integer semesterNumber;

    @Column(nullable = false)
    private Integer maxInternalMarks = 50;

    @Column(nullable = false)
    private Integer passInternalMarks = 20;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(name = "academic_year_id", length = 50)
    private String academicYearId;

    @Column(name = "course_type", length = 50)
    private String courseType = "Core Theory";

    @Column(name = "classroom_or_slot", length = 150)
    private String classroomOrSlot = "Room 301";

    @Column(name = "assigned_faculty_id", length = 50)
    private String assignedFacultyId = "FAC01";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Subject() {}

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }
    public Integer getSemesterNumber() { return semesterNumber; }
    public void setSemesterNumber(Integer semesterNumber) { this.semesterNumber = semesterNumber; }
    public Integer getMaxInternalMarks() { return maxInternalMarks; }
    public void setMaxInternalMarks(Integer maxInternalMarks) { this.maxInternalMarks = maxInternalMarks; }
    public Integer getPassInternalMarks() { return passInternalMarks; }
    public void setPassInternalMarks(Integer passInternalMarks) { this.passInternalMarks = passInternalMarks; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }

    public String getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(String academicYearId) { this.academicYearId = academicYearId; }
    public String getCourseType() { return courseType; }
    public void setCourseType(String courseType) { this.courseType = courseType; }
    public String getClassroomOrSlot() { return classroomOrSlot; }
    public void setClassroomOrSlot(String classroomOrSlot) { this.classroomOrSlot = classroomOrSlot; }
    public String getAssignedFacultyId() { return assignedFacultyId; }
    public void setAssignedFacultyId(String assignedFacultyId) { this.assignedFacultyId = assignedFacultyId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
