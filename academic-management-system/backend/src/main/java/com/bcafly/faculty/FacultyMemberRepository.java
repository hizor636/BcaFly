package com.bcafly.faculty;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyMemberRepository extends JpaRepository<FacultyMember, String> {
    Optional<FacultyMember> findByFacultyCode(String facultyCode);
    boolean existsByFacultyCode(String facultyCode);
    List<FacultyMember> findByEmploymentStatus(String employmentStatus);
}
