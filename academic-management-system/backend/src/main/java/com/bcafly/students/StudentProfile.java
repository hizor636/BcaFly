package com.bcafly.students;

import com.bcafly.academics.Section;
import com.bcafly.academics.Semester;
import com.bcafly.faculty.FacultyProfile;
import com.bcafly.users.User;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, unique = true, length = 50)
    private String regNo;

    @Column(length = 50)
    private String rollNo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_semester_id")
    private Semester currentSemester;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "section_id")
    private Section section;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mentor_id")
    private FacultyProfile mentor;

    @Column(precision = 4, scale = 2)
    private BigDecimal cgpa = BigDecimal.ZERO;

    @Column(precision = 5, scale = 2)
    private BigDecimal attendancePct = BigDecimal.ZERO;

    @Column(length = 20)
    private String riskStatus = "LOW";

    public StudentProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getRegNo() { return regNo; }
    public void setRegNo(String regNo) { this.regNo = regNo; }
    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }
    public Semester getCurrentSemester() { return currentSemester; }
    public void setCurrentSemester(Semester currentSemester) { this.currentSemester = currentSemester; }
    public Section getSection() { return section; }
    public void setSection(Section section) { this.section = section; }
    public FacultyProfile getMentor() { return mentor; }
    public void setMentor(FacultyProfile mentor) { this.mentor = mentor; }
    public BigDecimal getCgpa() { return cgpa; }
    public void setCgpa(BigDecimal cgpa) { this.cgpa = cgpa; }
    public BigDecimal getAttendancePct() { return attendancePct; }
    public void setAttendancePct(BigDecimal attendancePct) { this.attendancePct = attendancePct; }
    public String getRiskStatus() { return riskStatus; }
    public void setRiskStatus(String riskStatus) { this.riskStatus = riskStatus; }
    public Long getCurrentSemesterId() { return currentSemester != null ? currentSemester.getId() : null; }
    public Long getSectionId() { return section != null ? section.getId() : null; }
}
