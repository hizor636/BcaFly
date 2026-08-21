package com.bcafly.announcements;

import com.bcafly.users.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementController(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    @GetMapping
    public List<Announcement> getActiveAnnouncements() {
        return announcementRepository.findByIsActiveTrueOrderByPublishDateDesc();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<?> publishAnnouncement(@RequestBody CreateAnnouncementRequest req) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();

        Announcement ann = new Announcement();
        ann.setTitle(req.title());
        ann.setContent(req.content());
        ann.setCategory(req.category() != null ? req.category() : "Academic Notice");
        ann.setTargetRole(req.targetRole() != null ? req.targetRole() : "ALL");
        ann.setTargetSemester(req.targetSemester());
        ann.setCreatedBy(currentUser);
        ann.setPublishDate(req.publishDate() != null ? req.publishDate() : LocalDate.now());
        ann.setExpiryDate(req.expiryDate());
        ann.setIsActive(true);

        announcementRepository.save(ann);
        return ResponseEntity.ok(ann);
    }

    public record CreateAnnouncementRequest(String title, String content, String category,
                                            String targetRole, Integer targetSemester,
                                            LocalDate publishDate, LocalDate expiryDate) {}
}
