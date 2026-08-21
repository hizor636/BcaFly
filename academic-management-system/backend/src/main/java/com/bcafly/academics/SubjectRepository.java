package com.bcafly.academics;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findBySemesterNumberAndIsActiveTrue(Integer semesterNumber);
    List<Subject> findByIsActiveTrue();
}
