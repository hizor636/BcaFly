package com.bcafly.announcements;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByIsActiveTrueOrderByPublishDateDesc();
    List<Announcement> findByTargetRoleInOrTargetRole(List<String> roles, String targetRole);
}
