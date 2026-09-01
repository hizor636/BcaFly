package com.bcafly.portfolio;

import com.bcafly.academics.SemesterRepository;
import com.bcafly.faculty.FacultyProfile;
import com.bcafly.faculty.FacultyProfileRepository;
import com.bcafly.students.StudentProfile;
import com.bcafly.students.StudentProfileRepository;
import com.bcafly.users.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolio")
@SuppressWarnings("null")
public class PortfolioController {

    private final StudentEventSubmissionRepository submissionRepository;
    private final EventCategoryRepository categoryRepository;
    private final OdRequestRepository odRepository;
    private final StudentProfileRepository studentRepository;
    private final SemesterRepository semesterRepository;
    private final FacultyProfileRepository facultyRepository;

    public PortfolioController(StudentEventSubmissionRepository submissionRepository,
                               EventCategoryRepository categoryRepository,
                               OdRequestRepository odRepository,
                               StudentProfileRepository studentRepository,
                               SemesterRepository semesterRepository,
                               FacultyProfileRepository facultyRepository) {
        this.submissionRepository = submissionRepository;
        this.categoryRepository = categoryRepository;
        this.odRepository = odRepository;
        this.studentRepository = studentRepository;
        this.semesterRepository = semesterRepository;
        this.facultyRepository = facultyRepository;
    }

    @GetMapping("/categories")
    public List<EventCategory> getCategories() {
        return categoryRepository.findAll();
    }

    @GetMapping("/submissions")
    public List<StudentEventSubmission> getSubmissions(@RequestParam(required = false) Long studentId,
                                                      @RequestParam(required = false) String status) {
        if (studentId != null) return submissionRepository.findByStudentId(studentId);
        if (status != null) return submissionRepository.findByVerificationStatus(status);
        return submissionRepository.findAll();
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitEvent(@RequestBody EventSubmissionRequest req) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        StudentProfile student = studentRepository.findByUserId(currentUser.getId()).orElse(null);

        if (student == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Student profile not found"));
        }

        StudentEventSubmission sub = new StudentEventSubmission();
        sub.setSubmissionCode("ACT-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        sub.setStudent(student);
        if (req.semesterId() != null) {
            semesterRepository.findById(req.semesterId()).ifPresent(sub::setSemester);
        } else {
            sub.setSemester(student.getCurrentSemester());
        }
        sub.setEventName(req.eventName());
        if (req.categoryId() != null) {
            categoryRepository.findById(req.categoryId()).ifPresent(sub::setCategory);
        }
        sub.setOrganizer(req.organizer());
        sub.setStartDate(req.startDate());
        sub.setEndDate(req.endDate() != null ? req.endDate() : req.startDate());
        sub.setMode(req.mode() != null ? req.mode() : "OFFLINE");
        sub.setVenueOrUrl(req.venueOrUrl());
        sub.setDescription(req.description());
        sub.setSkillsSummary(req.skillsSummary());
        sub.setVerificationStatus("SUBMITTED");
        submissionRepository.save(sub);

        if (req.requestOd() && req.odReason() != null) {
            OdRequest od = new OdRequest();
            od.setStudent(student);
            od.setSubmission(sub);
            od.setRequestedDate(req.startDate());
            od.setReason(req.odReason());
            od.setFacultyStatus("PENDING");
            od.setHodStatus("PENDING");
            odRepository.save(od);
        }

        return ResponseEntity.ok(sub);
    }

    @PutMapping("/submissions/{id}/verify")
    @PreAuthorize("hasAnyRole('FACULTY', 'HOD', 'ADMIN')")
    public ResponseEntity<?> verifySubmission(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        FacultyProfile faculty = facultyRepository.findByUserId(currentUser.getId()).orElse(null);

        return submissionRepository.findById(id).map(sub -> {
            String status = body.get("status"); // VERIFIED, NEEDS_PROOF, REJECTED
            sub.setVerificationStatus(status);
            if (body.containsKey("remarks")) {
                sub.setFacultyRemarks(body.get("remarks"));
            }
            sub.setVerifiedBy(faculty);
            sub.setVerifiedAt(LocalDateTime.now());
            submissionRepository.save(sub);
            return ResponseEntity.ok(sub);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/od-requests")
    public List<OdRequest> getOdRequests(@RequestParam(required = false) Long studentId,
                                         @RequestParam(required = false) String status) {
        if (studentId != null) return odRepository.findByStudentId(studentId);
        if (status != null) return odRepository.findByHodStatus(status);
        return odRepository.findAll();
    }

    @PutMapping("/od-requests/{id}/approve")
    @PreAuthorize("hasAnyRole('HOD', 'ADMIN')")
    public ResponseEntity<?> approveOdRequest(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return odRepository.findById(id).map(od -> {
            String status = body.get("status"); // APPROVED, REJECTED
            od.setHodStatus(status);
            if (body.containsKey("notes")) {
                od.setApprovalNotes(body.get("notes"));
            }
            odRepository.save(od);
            return ResponseEntity.ok(od);
        }).orElse(ResponseEntity.notFound().build());
    }

    public record EventSubmissionRequest(String eventName, Long categoryId, Long semesterId,
                                         String organizer, LocalDate startDate, LocalDate endDate,
                                         String mode, String venueOrUrl, String description,
                                         String skillsSummary, boolean requestOd, String odReason) {}
}
