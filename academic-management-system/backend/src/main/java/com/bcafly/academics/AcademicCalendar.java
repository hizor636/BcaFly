package com.bcafly.academics;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "academic_calendar")
public class AcademicCalendar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "semester_id")
    private Semester semester;

    @Column(nullable = false)
    private LocalDate eventDate;

    @Column(nullable = false, length = 30)
    private String dayType; // WORKING_DAY, WEEKEND, PUBLIC_HOLIDAY, COLLEGE_HOLIDAY, EXAM_DAY, VACATION, SPECIAL_WORKING_DAY

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Boolean isWorkingDay = true;

    public AcademicCalendar() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Semester getSemester() { return semester; }
    public void setSemester(Semester semester) { this.semester = semester; }
    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
    public String getDayType() { return dayType; }
    public void setDayType(String dayType) { this.dayType = dayType; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsWorkingDay() { return isWorkingDay; }
    public void setIsWorkingDay(Boolean workingDay) { isWorkingDay = workingDay; }
}
