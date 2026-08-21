package com.bcafly.students;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUserId(Long userId);
    Optional<StudentProfile> findByRegNo(String regNo);
    List<StudentProfile> findByCurrentSemesterId(Long semesterId);
    List<StudentProfile> findByCurrentSemesterIdAndSectionId(Long semesterId, Long sectionId);
    List<StudentProfile> findByMentorId(Long mentorId);
}
