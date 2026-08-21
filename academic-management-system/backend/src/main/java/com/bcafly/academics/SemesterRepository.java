package com.bcafly.academics;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SemesterRepository extends JpaRepository<Semester, Long> {
    List<Semester> findByAcademicYearId(Long academicYearId);
    List<Semester> findByIsActiveTrue();
}
