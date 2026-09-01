package com.bcafly.faculty;

import com.bcafly.common.AuditService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/faculty-allocations")
@SuppressWarnings("null")
public class FacultyAllocationController {

    private final FacultyCourseAssignmentRepository assignmentRepository;
    private final FacultyMemberRepository facultyMemberRepository;
    private final AuditService auditService;

    public FacultyAllocationController(FacultyCourseAssignmentRepository assignmentRepository,
                                       FacultyMemberRepository facultyMemberRepository,
                                       AuditService auditService) {
        this.assignmentRepository = assignmentRepository;
        this.facultyMemberRepository = facultyMemberRepository;
        this.auditService = auditService;
    }

    /**
     * GET /api/faculty-allocations?semesterId=3&academicYearId=2024-25-even
     */
    @GetMapping
    public ResponseEntity<?> listAllocations(
            @RequestParam("semesterId") Integer semesterId,
            @RequestParam(value = "academicYearId", defaultValue = "2024-25-even") String academicYearId) {

        List<FacultyCourseAssignment> assignments = assignmentRepository.findBySemesterIdAndAcademicYearIdAndStatus(
                semesterId, academicYearId, "ACTIVE");

        List<Map<String, Object>> result = assignments.stream().map(a -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", a.getId());
            map.put("facultyId", a.getFaculty() != null ? a.getFaculty().getId() : null);
            map.put("facultyCode", a.getFaculty() != null ? a.getFaculty().getFacultyCode() : null);
            map.put("facultyName", a.getFaculty() != null ? a.getFaculty().getFullName() : null);
            map.put("courseId", a.getCourseId());
            map.put("courseCode", a.getCourseCode());
            map.put("semesterId", a.getSemesterId());
            map.put("academicYearId", a.getAcademicYearId());
            map.put("teachingLoad", a.getWeeklyTeachingCredits());
            map.put("weeklyTeachingCredits", a.getWeeklyTeachingCredits());
            map.put("isLabIncharge", "LAB_INCHARGE".equalsIgnoreCase(a.getAssignedRole()));
            map.put("assignedRole", a.getAssignedRole());
            map.put("status", a.getStatus());
            map.put("createdAt", a.getCreatedAt());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/faculty-allocations
     */
    @PostMapping
    @Transactional
    public ResponseEntity<?> createAllocation(@RequestBody Map<String, Object> payload) {
        String facultyId = (String) payload.get("facultyId");
        String courseId = (String) (payload.get("courseId") != null ? payload.get("courseId") : payload.get("courseCode"));
        Integer semesterId = payload.get("semesterId") != null ? Integer.parseInt(payload.get("semesterId").toString()) : 3;
        String academicYearId = (String) payload.getOrDefault("academicYearId", "2024-25-even");
        
        Integer credits = 4;
        if (payload.get("teachingLoad") != null) {
            credits = Integer.parseInt(payload.get("teachingLoad").toString());
        } else if (payload.get("weeklyTeachingCredits") != null) {
            credits = Integer.parseInt(payload.get("weeklyTeachingCredits").toString());
        }

        boolean isLab = Boolean.TRUE.equals(payload.get("isLabIncharge"));
        String role = (String) payload.getOrDefault("assignedRole", isLab ? "LAB_INCHARGE" : "PRIMARY");

        FacultyMember faculty = facultyMemberRepository.findById(facultyId)
                .or(() -> facultyMemberRepository.findByFacultyCode(facultyId))
                .orElse(null);

        if (faculty == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Faculty profile not found."));
        }

        // Check duplicate assignment
        boolean exists = assignmentRepository.existsByFacultyIdAndCourseIdAndSemesterIdAndAcademicYearIdAndStatus(
                faculty.getId(), courseId, semesterId, academicYearId, "ACTIVE");

        if (exists) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "message", "This faculty member is already assigned to this course for the selected semester."
            ));
        }

        FacultyCourseAssignment assignment = new FacultyCourseAssignment();
        assignment.setId("ASG-" + UUID.randomUUID().toString());
        assignment.setFaculty(faculty);
        assignment.setCourseId(courseId);
        assignment.setCourseCode(courseId);
        assignment.setSemesterId(semesterId);
        assignment.setAcademicYearId(academicYearId);
        assignment.setWeeklyTeachingCredits(credits);
        assignment.setAssignedRole(role);
        assignment.setStatus("ACTIVE");

        FacultyCourseAssignment saved = assignmentRepository.save(assignment);

        auditService.log("FACULTY_ASSIGNED", "FacultyCourseAssignment", null,
                String.format("Assigned faculty %s to course %s in Semester %d", faculty.getFullName(), courseId, semesterId));

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Faculty allocated successfully.",
                "allocationId", saved.getId(),
                "data", saved
        ));
    }

    /**
     * DELETE /api/faculty-allocations/{allocationId}
     */
    @DeleteMapping("/{allocationId}")
    @Transactional
    public ResponseEntity<?> removeAllocation(@PathVariable String allocationId) {
        Optional<FacultyCourseAssignment> opt = assignmentRepository.findById(allocationId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", "Allocation not found."
            ));
        }

        FacultyCourseAssignment assignment = opt.get();
        assignment.setStatus("REMOVED");
        assignmentRepository.save(assignment);

        auditService.log("FACULTY_ASSIGNMENT_REMOVED", "FacultyCourseAssignment", null,
                String.format("Removed allocation %s for course %s", allocationId, assignment.getCourseCode()));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Faculty course allocation removed successfully."
        ));
    }
}
