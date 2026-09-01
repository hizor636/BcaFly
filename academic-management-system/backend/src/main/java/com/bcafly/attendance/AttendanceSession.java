package com.bcafly.attendance;

import com.bcafly.academics.Section;
import com.bcafly.academics.Semester;
import com.bcafly.academics.Subject;
import com.bcafly.faculty.FacultyProfile;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_sessions")
public class AttendanceSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = false)
    private FacultyProfile faculty;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @Column(nullable = false)
    private LocalDate sessionDate;

    @Column(nullable = false)
    private Integer periodNumber = 1;

    private String topic;

    @Column(nullable = false, length = 20)
    private String status = "SUBMITTED";

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public AttendanceSession() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public FacultyProfile getFaculty() { return faculty; }
    public void setFaculty(FacultyProfile faculty) { this.faculty = faculty; }
    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }
    public Section getSection() { return section; }
    public void setSection(Section section) { this.section = section; }
    public Semester getSemester() { return semester; }
    public void setSemester(Semester semester) { this.semester = semester; }
    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }
    public Integer getPeriodNumber() { return periodNumber; }
    public void setPeriodNumber(Integer periodNumber) { this.periodNumber = periodNumber; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
