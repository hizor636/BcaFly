package com.bcafly.portfolio;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentEventSubmissionRepository extends JpaRepository<StudentEventSubmission, Long> {
    List<StudentEventSubmission> findByStudentId(Long studentId);
    List<StudentEventSubmission> findByVerificationStatus(String verificationStatus);
    List<StudentEventSubmission> findBySemesterId(Long semesterId);
}
