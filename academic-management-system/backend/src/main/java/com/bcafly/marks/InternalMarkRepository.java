package com.bcafly.marks;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface InternalMarkRepository extends JpaRepository<InternalMark, Long> {
    @Query("SELECT im FROM InternalMark im WHERE im.student.id = :studentId")
    List<InternalMark> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT im FROM InternalMark im WHERE im.subject.id = :subjectId AND im.semester.id = :semesterId")
    List<InternalMark> findBySubjectIdAndSemesterId(@Param("subjectId") Long subjectId, @Param("semesterId") Long semesterId);

    List<InternalMark> findByStatus(String status);
}
