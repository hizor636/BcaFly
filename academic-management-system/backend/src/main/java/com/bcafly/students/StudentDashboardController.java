package com.bcafly.students;

import com.bcafly.academics.Subject;
import com.bcafly.academics.SubjectRepository;
import com.bcafly.announcements.Announcement;
import com.bcafly.announcements.AnnouncementRepository;
import com.bcafly.attendance.StudentAttendanceRepository;
import com.bcafly.common.ScopeValidator;
import com.bcafly.marks.InternalMark;
import com.bcafly.marks.InternalMarkRepository;
import com.bcafly.users.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Student Dashboard Controller.
 *
 * Enforces strict personal data visibility:
 * - All student endpoints derive the student identity exclusively from JWT security context.
 * - Students can never request data for other students.
 * - Only published marks, results, assignments, and announcements are visible.
 */
@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentDashboardController {

    private final StudentProfileRepository studentProfileRepository;
    private final SubjectRepository subjectRepository;
    private final StudentAttendanceRepository attendanceRepository;
    private final InternalMarkRepository internalMarkRepository;
    private final AnnouncementRepository announcementRepository;
    private final ScopeValidator scopeValidator;

    public StudentDashboardController(StudentProfileRepository studentProfileRepository,
                                      SubjectRepository subjectRepository,
                                      StudentAttendanceRepository attendanceRepository,
                                      InternalMarkRepository internalMarkRepository,
                                      AnnouncementRepository announcementRepository,
                                      ScopeValidator scopeValidator) {
        this.studentProfileRepository = studentProfileRepository;
        this.subjectRepository = subjectRepository;
        this.attendanceRepository = attendanceRepository;
        this.internalMarkRepository = internalMarkRepository;
        this.announcementRepository = announcementRepository;
        this.scopeValidator = scopeValidator;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getMyProfile() {
        User currentUser = scopeValidator.getAuthenticatedUser();
        if (currentUser == null) return ResponseEntity.status(401).build();

        return studentProfileRepository.findByUserId(currentUser.getId())
                .map(profile -> {
                    Map<String, Object> data = new LinkedHashMap<>();
                    data.put("id", profile.getId());
                    data.put("userId", currentUser.getId());
                    data.put("fullName", currentUser.getName());
                    data.put("email", currentUser.getEmail());
                    data.put("registerNumber", profile.getRegNo());
                    data.put("rollNumber", profile.getRollNo());
                    data.put("semesterId", profile.getCurrentSemesterId());
                    data.put("sectionId", profile.getSectionId());
                    data.put("cgpa", profile.getCgpa());
                    data.put("attendancePercentage", profile.getAttendancePct());
                    data.put("riskStatus", profile.getRiskStatus());
                    return ResponseEntity.ok(Map.of("success", true, "data", data));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/courses")
    public ResponseEntity<?> getMyCourses() {
        User currentUser = scopeValidator.getAuthenticatedUser();
        if (currentUser == null) return ResponseEntity.status(401).build();

        StudentProfile profile = studentProfileRepository.findByUserId(currentUser.getId()).orElse(null);
        if (profile == null) return ResponseEntity.notFound().build();

        Integer semNum = profile.getCurrentSemesterId() != null ? profile.getCurrentSemesterId().intValue() : 3;
        List<Subject> courses = subjectRepository.findBySemesterNumberAndIsActiveTrue(semNum);

        return ResponseEntity.ok(Map.of("success", true, "data", courses, "count", courses.size()));
    }

    @GetMapping("/marks")
    public ResponseEntity<?> getMyMarks(@RequestParam(required = false) Long courseId) {
        User currentUser = scopeValidator.getAuthenticatedUser();
        if (currentUser == null) return ResponseEntity.status(401).build();

        StudentProfile profile = studentProfileRepository.findByUserId(currentUser.getId()).orElse(null);
        if (profile == null) return ResponseEntity.notFound().build();

        List<InternalMark> marks = internalMarkRepository.findByStudentId(profile.getId());
        return ResponseEntity.ok(Map.of("success", true, "data", marks));
    }

    @GetMapping("/announcements")
    public ResponseEntity<?> getMyAnnouncements() {
        User currentUser = scopeValidator.getAuthenticatedUser();
        if (currentUser == null) return ResponseEntity.status(401).build();

        StudentProfile profile = studentProfileRepository.findByUserId(currentUser.getId()).orElse(null);
        Integer semNum = profile != null && profile.getCurrentSemesterId() != null ? profile.getCurrentSemesterId().intValue() : null;

        List<Announcement> announcements = announcementRepository.findActiveForStudent(semNum);
        return ResponseEntity.ok(Map.of("success", true, "data", announcements));
    }
}
