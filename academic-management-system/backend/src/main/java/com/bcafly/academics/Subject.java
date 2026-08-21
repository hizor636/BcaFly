package com.bcafly.academics;

import jakarta.persistence.*;

@Entity
@Table(name = "subjects")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
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

    public Subject() {}

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
}
