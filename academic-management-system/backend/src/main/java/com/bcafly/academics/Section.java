package com.bcafly.academics;

import jakarta.persistence.*;

@Entity
@Table(name = "sections", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"semester_id", "name"})
})
public class Section {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @Column(nullable = false, length = 10)
    private String name;

    public Section() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Semester getSemester() { return semester; }
    public void setSemester(Semester semester) { this.semester = semester; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
