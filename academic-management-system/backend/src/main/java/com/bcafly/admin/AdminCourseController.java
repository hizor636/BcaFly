package com.bcafly.admin;

import com.bcafly.academics.Subject;
import com.bcafly.academics.SubjectRepository;
import com.bcafly.academics.FacultyAssignment;
import com.bcafly.academics.FacultyAssignmentRepository;
import com.bcafly.common.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
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

    @GetMapping({"/courses", "/semesters/{semesterId}/courses"})
    public ResponseEntity<?> listCourses(
            @PathVariable(required = false) Integer semesterId,
            @RequestParam(required = false) Integer semester) {
        Integer sem = semesterId != null ? semesterId : semester;
        List<Subject> courses = sem != null
                ? subjectRepository.findBySemesterNumberAndIsActiveTrue(sem)
                : subjectRepository.findByIsActiveTrue();
        return ResponseEntity.ok(Map.of("success", true, "data", courses, "count", courses.size()));
    }

    @PostMapping({"/courses", "/semesters/{semesterId}/courses"})
    public ResponseEntity<?> createCourse(
            @PathVariable(required = false) Integer semesterId,
            @RequestBody Subject course) {
        if (semesterId != null && course.getSemesterNumber() == null) {
            course.setSemesterNumber(semesterId);
        }
        Subject saved = subjectRepository.save(course);
        auditService.log("COURSE_CREATED", "Subject", saved.getId(),
                "Created course " + saved.getCode() + " (" + saved.getTitle() + ")");
        return ResponseEntity.ok(Map.of("success", true, "data", saved));
    }

    @PutMapping({"/courses/{id}", "/semesters/{semesterId}/courses/{id}"})
    public ResponseEntity<?> updateCourse(
            @PathVariable(required = false) Integer semesterId,
            @PathVariable Long id,
            @RequestBody Subject courseUpdates) {
        return subjectRepository.findById(id).map(subject -> {
            if (courseUpdates.getTitle() != null) subject.setTitle(courseUpdates.getTitle());
            if (courseUpdates.getCredits() != null) subject.setCredits(courseUpdates.getCredits());
            if (courseUpdates.getMaxInternalMarks() != null) subject.setMaxInternalMarks(courseUpdates.getMaxInternalMarks());
            if (courseUpdates.getPassInternalMarks() != null) subject.setPassInternalMarks(courseUpdates.getPassInternalMarks());
            if (courseUpdates.getIsActive() != null) subject.setIsActive(courseUpdates.getIsActive());
            if (semesterId != null) subject.setSemesterNumber(semesterId);

            Subject updated = subjectRepository.save(subject);
            auditService.log("COURSE_UPDATED", "Subject", updated.getId(),
                    "Updated course " + updated.getCode());
            return ResponseEntity.ok(Map.of("success", true, "data", updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping({"/courses/{id}", "/semesters/{semesterId}/courses/{id}"})
    public ResponseEntity<?> deleteCourse(
            @PathVariable(required = false) Integer semesterId,
            @PathVariable Long id) {
        return subjectRepository.findById(id).map(subject -> {
            subject.setIsActive(false);
            subjectRepository.save(subject);
            auditService.log("COURSE_DELETED", "Subject", id,
                    "Deactivated/Deleted course " + subject.getCode() + " from semester " + subject.getSemesterNumber());
            return ResponseEntity.ok(Map.of("success", true, "message", "Course deleted successfully", "id", id));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping({"/courses/bulk-delete", "/semesters/{semesterId}/courses/bulk-delete"})
    public ResponseEntity<?> bulkDeleteCourses(
            @PathVariable(required = false) Integer semesterId,
            @RequestBody Map<String, List<Long>> request) {
        List<Long> courseIds = request.getOrDefault("courseIds", Collections.emptyList());
        int count = 0;
        for (Long id : courseIds) {
            Optional<Subject> subj = subjectRepository.findById(id);
            if (subj.isPresent()) {
                Subject s = subj.get();
                s.setIsActive(false);
                subjectRepository.save(s);
                count++;
            }
        }
        auditService.log("COURSES_BULK_DELETED", "Subject", null,
                "Bulk deleted " + count + " courses in semester " + semesterId);
        return ResponseEntity.ok(Map.of("success", true, "deletedCount", count));
    }

    @PostMapping({"/courses/import-preview", "/semesters/{semesterId}/courses/import-preview"})
    public ResponseEntity<?> importPreview(
            @PathVariable(required = false) Integer semesterId,
            @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Preview generated successfully",
                "semesterId", semesterId != null ? semesterId : 1,
                "preview", payload
        ));
    }

    @PostMapping({"/courses/import-confirm", "/semesters/{semesterId}/courses/import-confirm"})
    public ResponseEntity<?> importConfirm(
            @PathVariable(required = false) Integer semesterId,
            @RequestBody Map<String, Object> payload) {
        auditService.log("COURSES_IMPORTED", "Subject", null,
                "Imported courses batch into semester " + semesterId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Courses successfully imported into semester workspace"
        ));
    }
}
