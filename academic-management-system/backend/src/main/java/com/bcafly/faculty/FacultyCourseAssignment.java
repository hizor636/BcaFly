package com.bcafly.faculty;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "faculty_course_assignments")
public class FacultyCourseAssignment {
    @Id
    @Column(length = 100)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = false)
    private FacultyMember faculty;

    @Column(name = "course_id", nullable = false, length = 100)
    private String courseId;

    @Column(name = "course_code", nullable = false, length = 50)
    private String courseCode;

    @Column(name = "semester_id", nullable = false)
    private Integer semesterId;

    @Column(name = "academic_year_id", nullable = false, length = 50)
    private String academicYearId;

    @Column(name = "weekly_teaching_credits", nullable = false)
    private Integer weeklyTeachingCredits = 4;

    @Column(name = "assigned_role", nullable = false, length = 30)
    private String assignedRole = "PRIMARY";

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public FacultyCourseAssignment() {}

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public FacultyMember getFaculty() { return faculty; }
    public void setFaculty(FacultyMember faculty) { this.faculty = faculty; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
    public Integer getSemesterId() { return semesterId; }
    public void setSemesterId(Integer semesterId) { this.semesterId = semesterId; }
    public String getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(String academicYearId) { this.academicYearId = academicYearId; }
    public Integer getWeeklyTeachingCredits() { return weeklyTeachingCredits; }
    public void setWeeklyTeachingCredits(Integer weeklyTeachingCredits) { this.weeklyTeachingCredits = weeklyTeachingCredits; }
    public String getAssignedRole() { return assignedRole; }
    public void setAssignedRole(String assignedRole) { this.assignedRole = assignedRole; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
