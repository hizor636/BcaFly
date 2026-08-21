package com.bcafly.attendance;

import com.bcafly.students.StudentProfile;
import jakarta.persistence.*;

@Entity
@Table(name = "student_attendance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"session_id", "student_id"})
})
public class StudentAttendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private AttendanceSession session;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @Column(nullable = false)
    private Boolean isPresent = true;

    @Column(nullable = false)
    private Boolean isOd = false;

    private String remarks;

    public StudentAttendance() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AttendanceSession getSession() { return session; }
    public void setSession(AttendanceSession session) { this.session = session; }
    public StudentProfile getStudent() { return student; }
    public void setStudent(StudentProfile student) { this.student = student; }
    public Boolean getIsPresent() { return isPresent; }
    public void setIsPresent(Boolean present) { isPresent = present; }
    public Boolean getIsOd() { return isOd; }
    public void setIsOd(Boolean od) { isOd = od; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
