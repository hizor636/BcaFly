package com.bcafly.faculty;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyCourseAssignmentRepository extends JpaRepository<FacultyCourseAssignment, String> {
    List<FacultyCourseAssignment> findBySemesterIdAndAcademicYearId(Integer semesterId, String academicYearId);
    List<FacultyCourseAssignment> findBySemesterIdAndAcademicYearIdAndStatus(Integer semesterId, String academicYearId, String status);
    List<FacultyCourseAssignment> findByFacultyIdAndSemesterIdAndAcademicYearIdAndStatus(String facultyId, Integer semesterId, String academicYearId, String status);
    Optional<FacultyCourseAssignment> findByIdAndSemesterIdAndAcademicYearId(String id, Integer semesterId, String academicYearId);
    Optional<FacultyCourseAssignment> findByFacultyIdAndCourseIdAndSemesterIdAndAcademicYearId(String facultyId, String courseId, Integer semesterId, String academicYearId);
    boolean existsByFacultyIdAndCourseIdAndSemesterIdAndAcademicYearIdAndStatus(String facultyId, String courseId, Integer semesterId, String academicYearId, String status);

    @Transactional
    void deleteBySemesterIdAndAcademicYearId(Integer semesterId, String academicYearId);
}
