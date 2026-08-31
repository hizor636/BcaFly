package com.bcafly.faculty;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "faculty_members")
public class FacultyMember {
    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "faculty_code", nullable = false, unique = true, length = 50)
    private String facultyCode;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false, length = 100)
    private String designation = "Assistant Professor";

    @Column(nullable = false, length = 50)
    private String department = "BCA";

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "employment_status", nullable = false, length = 20)
    private String employmentStatus = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public FacultyMember() {}

    public FacultyMember(String id, String facultyCode, String fullName, String designation, String department, String email, String phone) {
        this.id = id;
        this.facultyCode = facultyCode;
        this.fullName = fullName;
        this.designation = designation;
        this.department = department;
        this.email = email;
        this.phone = phone;
        this.employmentStatus = "ACTIVE";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFacultyCode() { return facultyCode; }
    public void setFacultyCode(String facultyCode) { this.facultyCode = facultyCode; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmploymentStatus() { return employmentStatus; }
    public void setEmploymentStatus(String employmentStatus) { this.employmentStatus = employmentStatus; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
