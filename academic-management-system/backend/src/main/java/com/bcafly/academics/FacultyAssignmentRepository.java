package com.bcafly.academics;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FacultyAssignmentRepository extends JpaRepository<FacultyAssignment, Long> {
    List<FacultyAssignment> findByFacultyId(Long facultyId);
    List<FacultyAssignment> findBySemesterId(Long semesterId);
}
