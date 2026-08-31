package com.bcafly.students;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentEnrolmentRepository extends JpaRepository<StudentEnrolment, String> {
    List<StudentEnrolment> findBySemesterIdAndAcademicYearId(Integer semesterId, String academicYearId);
    List<StudentEnrolment> findBySemesterIdAndAcademicYearIdAndEnrolmentStatus(Integer semesterId, String academicYearId, String enrolmentStatus);
    List<StudentEnrolment> findBySemesterIdAndAcademicYearIdAndSectionAndEnrolmentStatus(Integer semesterId, String academicYearId, String section, String enrolmentStatus);
    Optional<StudentEnrolment> findBySemesterIdAndAcademicYearIdAndUsn(Integer semesterId, String academicYearId, String usn);
    Optional<StudentEnrolment> findByIdAndSemesterIdAndAcademicYearId(String id, Integer semesterId, String academicYearId);
    boolean existsBySemesterIdAndAcademicYearIdAndUsn(Integer semesterId, String academicYearId, String usn);

    @Transactional
    void deleteBySemesterIdAndAcademicYearId(Integer semesterId, String academicYearId);
}
