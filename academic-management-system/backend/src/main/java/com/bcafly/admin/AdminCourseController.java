package com.bcafly.admin;

import com.bcafly.academics.Subject;
import com.bcafly.academics.SubjectRepository;
import com.bcafly.academics.FacultyAssignment;
import com.bcafly.academics.FacultyAssignmentRepository;
import com.bcafly.common.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/courses")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCourseController {

    private final SubjectRepository subjectRepository;
    private final FacultyAssignmentRepository facultyAssignmentRepository;
    private final AuditService auditService;

    public AdminCourseController(SubjectRepository subjectRepository,
                                 FacultyAssignmentRepository facultyAssignmentRepository,
                                 AuditService auditService) {
        this.subjectRepository = subjectRepository;
        this.facultyAssignmentRepository = facultyAssignmentRepository;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<?> listCourses(@RequestParam(required = false) Integer semester) {
        List<Subject> courses = semester != null
                ? subjectRepository.findBySemesterNumberAndIsActiveTrue(semester)
                : subjectRepository.findByIsActiveTrue();
        return ResponseEntity.ok(Map.of("success", true, "data", courses, "count", courses.size()));
    }

    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody Subject course) {
        Subject saved = subjectRepository.save(course);
        auditService.log("COURSE_CREATED", "Subject", saved.getId(),
                "Created course " + saved.getCode() + " (" + saved.getTitle() + ")");
        return ResponseEntity.ok(Map.of("success", true, "data", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody Subject courseUpdates) {
        return subjectRepository.findById(id).map(subject -> {
            subject.setTitle(courseUpdates.getTitle());
            subject.setCredits(courseUpdates.getCredits());
            subject.setMaxInternalMarks(courseUpdates.getMaxInternalMarks());
            subject.setPassInternalMarks(courseUpdates.getPassInternalMarks());
            subject.setIsActive(courseUpdates.getIsActive());
            Subject updated = subjectRepository.save(subject);
            auditService.log("COURSE_UPDATED", "Subject", updated.getId(),
                    "Updated course " + updated.getCode());
            return ResponseEntity.ok(Map.of("success", true, "data", updated));
        }).orElse(ResponseEntity.notFound().build());
    }
}
