package com.bcafly.marks;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InternalMarkRepository extends JpaRepository<InternalMark, Long> {
    List<InternalMark> findByStudentId(Long studentId);
    List<InternalMark> findBySubjectIdAndSemesterId(Long subjectId, Long semesterId);
    List<InternalMark> findByStatus(String status);
}
