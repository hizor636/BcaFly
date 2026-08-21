package com.bcafly.attendance;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    List<AttendanceSession> findByFacultyId(Long facultyId);
    List<AttendanceSession> findBySubjectIdAndSectionId(Long subjectId, Long sectionId);
    List<AttendanceSession> findBySessionDate(LocalDate date);
}
