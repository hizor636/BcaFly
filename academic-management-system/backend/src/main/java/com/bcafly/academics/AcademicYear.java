package com.bcafly.academics;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "academic_years")
public class AcademicYear {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String yearLabel;

    @Column(nullable = false)
    private Boolean isCurrent = false;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    public AcademicYear() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getYearLabel() { return yearLabel; }
    public void setYearLabel(String yearLabel) { this.yearLabel = yearLabel; }
    public Boolean getIsCurrent() { return isCurrent; }
    public void setIsCurrent(Boolean current) { isCurrent = current; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
