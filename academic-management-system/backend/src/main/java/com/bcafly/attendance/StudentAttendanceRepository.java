package com.bcafly.attendance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface StudentAttendanceRepository extends JpaRepository<StudentAttendance, Long> {
    List<StudentAttendance> findBySessionId(Long sessionId);
    List<StudentAttendance> findByStudentId(Long studentId);

    @Query("SELECT COUNT(sa) FROM StudentAttendance sa WHERE sa.student.id = :studentId")
    long countTotalByStudent(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(sa) FROM StudentAttendance sa WHERE sa.student.id = :studentId AND (sa.isPresent = true OR sa.isOd = true)")
    long countPresentByStudent(@Param("studentId") Long studentId);
}
