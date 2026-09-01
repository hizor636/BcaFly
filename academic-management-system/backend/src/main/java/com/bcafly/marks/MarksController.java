package com.bcafly.marks;

import com.bcafly.academics.SemesterRepository;
import com.bcafly.academics.SubjectRepository;
import com.bcafly.faculty.FacultyProfile;
import com.bcafly.faculty.FacultyProfileRepository;
import com.bcafly.students.StudentProfile;
import com.bcafly.students.StudentProfileRepository;
import com.bcafly.users.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marks")
@SuppressWarnings("all")
public class MarksController {

    private final InternalMarkRepository markRepository;
    private final StudentProfileRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final SemesterRepository semesterRepository;
    private final FacultyProfileRepository facultyRepository;

    public MarksController(InternalMarkRepository markRepository,
                           StudentProfileRepository studentRepository,
                           SubjectRepository subjectRepository,
                           SemesterRepository semesterRepository,
                           FacultyProfileRepository facultyRepository) {
        this.markRepository = markRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.semesterRepository = semesterRepository;
        this.facultyRepository = facultyRepository;
    }

    @GetMapping
    public List<InternalMark> getMarks(@RequestParam(required = false) Long studentId,
                                       @RequestParam(required = false) Long subjectId,
                                       @RequestParam(required = false) Long semesterId,
                                       @RequestParam(required = false) String status) {
        if (studentId != null) return markRepository.findByStudentId(studentId);
        if (status != null) return markRepository.findByStatus(status);
        if (subjectId != null && semesterId != null) {
            return markRepository.findBySubjectIdAndSemesterId(subjectId, semesterId);
        }
        return markRepository.findAll();
    }

    @PostMapping("/bulk-entry")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<?> enterBulkMarks(@RequestBody BulkMarksEntryRequest req) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        FacultyProfile faculty = facultyRepository.findByUserId(currentUser.getId()).orElse(null);

        List<InternalMark> savedList = new ArrayList<>();
        for (MarkEntry entry : req.entries()) {
            StudentProfile student = studentRepository.findById(entry.studentId()).orElse(null);
            if (student != null) {
                InternalMark mark = new InternalMark();
                mark.setStudent(student);
                subjectRepository.findById(req.subjectId()).ifPresent(mark::setSubject);
                semesterRepository.findById(req.semesterId()).ifPresent(mark::setSemester);
                mark.setTestName(req.testName());
                mark.setMarksObtained(entry.marksObtained());
                mark.setMaxMarks(req.maxMarks() != null ? req.maxMarks() : new BigDecimal("50.0"));
                mark.setStatus("SUBMITTED");
                mark.setSubmittedBy(faculty);
                mark.setRemarks(entry.remarks());
                savedList.add(markRepository.save(mark));
            }
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "count", savedList.size()
        ));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        String newStatus = body.get("status");

        return markRepository.findById(id).map(mark -> {
            mark.setStatus(newStatus);
            mark.setApprovedBy(currentUser);
            if (body.containsKey("remarks")) {
                mark.setRemarks(body.get("remarks"));
            }
            markRepository.save(mark);
            return ResponseEntity.ok(mark);
        }).orElse(ResponseEntity.notFound().build());
    }

    public record BulkMarksEntryRequest(Long subjectId, Long semesterId, String testName, BigDecimal maxMarks, List<MarkEntry> entries) {}
    public record MarkEntry(Long studentId, BigDecimal marksObtained, String remarks) {}
}
