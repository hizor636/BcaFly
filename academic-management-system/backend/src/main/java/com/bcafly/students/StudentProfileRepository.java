package com.bcafly.students;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUserId(Long userId);
    Optional<StudentProfile> findByRegNo(String regNo);
    boolean existsByRegNo(String regNo);

    @Query("SELECT sp FROM StudentProfile sp WHERE sp.currentSemester.id = :semesterId")
    List<StudentProfile> findByCurrentSemesterId(@Param("semesterId") Long semesterId);

    @Query("SELECT sp FROM StudentProfile sp WHERE sp.currentSemester.id = :semesterId AND sp.section.id = :sectionId")
    List<StudentProfile> findByCurrentSemesterIdAndSectionId(@Param("semesterId") Long semesterId, @Param("sectionId") Long sectionId);

    @Query("SELECT sp FROM StudentProfile sp WHERE sp.mentor.id = :mentorId")
    List<StudentProfile> findByMentorId(@Param("mentorId") Long mentorId);
}
