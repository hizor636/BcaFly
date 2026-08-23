package com.bcafly.announcements;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByIsActiveTrueOrderByPublishDateDesc();
    List<Announcement> findByTargetRoleInOrTargetRole(List<String> roles, String targetRole);

    @Query("SELECT a FROM Announcement a WHERE a.isActive = true AND (a.targetRole = 'ALL' OR a.targetRole = 'STUDENT') AND (a.targetSemester IS NULL OR a.targetSemester = :sem) ORDER BY a.publishDate DESC")
    List<Announcement> findActiveForStudent(@Param("sem") Integer sem);
}
