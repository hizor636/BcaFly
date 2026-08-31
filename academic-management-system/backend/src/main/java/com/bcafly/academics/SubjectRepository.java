package com.bcafly.academics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findBySemesterNumberAndIsActiveTrue(Integer semesterNumber);
    List<Subject> findByIsActiveTrue();
    List<Subject> findBySemesterNumberAndAcademicYearIdAndIsActiveTrue(Integer semesterNumber, String academicYearId);
    Optional<Subject> findBySemesterNumberAndAcademicYearIdAndCode(Integer semesterNumber, String academicYearId, String code);
    
    @Transactional
    void deleteBySemesterNumberAndAcademicYearId(Integer semesterNumber, String academicYearId);
}
