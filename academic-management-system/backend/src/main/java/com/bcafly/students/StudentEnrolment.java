package com.bcafly.students;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "student_enrolments")
public class StudentEnrolment {
    @Id
    @Column(length = 100)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, length = 50)
    private String usn;

    @Column(name = "semester_id", nullable = false)
    private Integer semesterId;

    @Column(name = "academic_year_id", nullable = false, length = 50)
    private String academicYearId;

    @Column(length = 1)
    private String section = "A";

    @Column(nullable = false, length = 50)
    private String batch = "2024–27";

    @Column(name = "roll_number")
    private Integer rollNumber;

    @Column(name = "enrolment_status", nullable = false, length = 20)
    private String enrolmentStatus = "ACTIVE";

    @Column(name = "attendance_percentage", precision = 5, scale = 2)
    private BigDecimal attendancePercentage = BigDecimal.valueOf(90.0);

    @Column(name = "current_sgpa", precision = 4, scale = 2)
    private BigDecimal currentSgpa = BigDecimal.valueOf(8.5);

    @Column(nullable = false, length = 20)
    private String standing = "PENDING";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public StudentEnrolment() {}

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public String getUsn() { return usn; }
    public void setUsn(String usn) { this.usn = usn; }
    public Integer getSemesterId() { return semesterId; }
    public void setSemesterId(Integer semesterId) { this.semesterId = semesterId; }
    public String getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(String academicYearId) { this.academicYearId = academicYearId; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
    public Integer getRollNumber() { return rollNumber; }
    public void setRollNumber(Integer rollNumber) { this.rollNumber = rollNumber; }
    public String getEnrolmentStatus() { return enrolmentStatus; }
    public void setEnrolmentStatus(String enrolmentStatus) { this.enrolmentStatus = enrolmentStatus; }
    public BigDecimal getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(BigDecimal attendancePercentage) { this.attendancePercentage = attendancePercentage; }
    public BigDecimal getCurrentSgpa() { return currentSgpa; }
    public void setCurrentSgpa(BigDecimal currentSgpa) { this.currentSgpa = currentSgpa; }
    public String getStanding() { return standing; }
    public void setStanding(String standing) { this.standing = standing; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
