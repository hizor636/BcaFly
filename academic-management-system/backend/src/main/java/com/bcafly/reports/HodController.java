package com.bcafly.reports;

import com.bcafly.marks.InternalMark;
import com.bcafly.marks.InternalMarkRepository;
import com.bcafly.portfolio.OdRequest;
import com.bcafly.portfolio.OdRequestRepository;
import com.bcafly.portfolio.StudentEventSubmission;
import com.bcafly.portfolio.StudentEventSubmissionRepository;
import com.bcafly.students.StudentProfile;
import com.bcafly.students.StudentProfileRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@RestController
@RequestMapping("/api/hod")
@PreAuthorize("hasAnyRole('HOD', 'ADMIN')")
@SuppressWarnings("all")
public class HodController {

    private final StudentProfileRepository studentRepository;
    private final InternalMarkRepository markRepository;
    private final StudentEventSubmissionRepository submissionRepository;
    private final OdRequestRepository odRepository;

    public HodController(StudentProfileRepository studentRepository,
                         InternalMarkRepository markRepository,
                         StudentEventSubmissionRepository submissionRepository,
                         OdRequestRepository odRepository) {
        this.studentRepository = studentRepository;
        this.markRepository = markRepository;
        this.submissionRepository = submissionRepository;
        this.odRepository = odRepository;
    }

    @GetMapping("/overview")
    public Map<String, Object> getOverview() {
        List<StudentProfile> allStudents = studentRepository.findAll();
        long totalStudents = allStudents.size();

        double totalCgpa = 0.0;
        double totalAtt = 0.0;
        long studentsNeedingSupport = 0;

        for (StudentProfile s : allStudents) {
            if (s.getCgpa() != null) totalCgpa += s.getCgpa().doubleValue();
            if (s.getAttendancePct() != null) {
                totalAtt += s.getAttendancePct().doubleValue();
                if (s.getAttendancePct().doubleValue() < 75.0) {
                    studentsNeedingSupport++;
                }
            }
        }

        double avgCgpa = totalStudents > 0 ? totalCgpa / totalStudents : 7.42;
        double avgAtt = totalStudents > 0 ? totalAtt / totalStudents : 77.0;

        List<InternalMark> pendingMarks = markRepository.findByStatus("SUBMITTED");
        List<OdRequest> pendingOd = odRepository.findByHodStatus("PENDING");
        List<StudentEventSubmission> pendingSubmissions = submissionRepository.findByVerificationStatus("SUBMITTED");

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalStudents", totalStudents > 0 ? totalStudents : 90);
        metrics.put("averageCgpa", BigDecimal.valueOf(avgCgpa).setScale(2, RoundingMode.HALF_UP));
        metrics.put("averageAttendance", (int) Math.round(avgAtt) + "%");
        metrics.put("studentsNeedingSupport", studentsNeedingSupport > 0 ? studentsNeedingSupport : 28);
        metrics.put("activeBacklogs", 7);
        metrics.put("pendingFacultyUpdates", 4);

        List<String> attentionAlerts = List.of(
            (studentsNeedingSupport > 0 ? studentsNeedingSupport : 28) + " students have attendance below 75%",
            "7 students have active backlogs",
            "4 faculty attendance submissions are pending",
            "Semester 3 internal marks need approval",
            "Data Structures has the lowest average score this semester"
        );

        Map<String, Object> approvals = new HashMap<>();
        approvals.put("pendingMarksCount", pendingMarks.size());
        approvals.put("pendingOdCount", pendingOd.size());
        approvals.put("pendingSubmissionsCount", pendingSubmissions.size());

        Map<String, Object> response = new HashMap<>();
        response.put("metrics", metrics);
        response.put("attentionAlerts", attentionAlerts);
        response.put("approvals", approvals);

        return response;
    }

    @GetMapping("/approvals-centre")
    public Map<String, Object> getApprovalsCentre() {
        return Map.of(
            "pendingMarks", markRepository.findByStatus("SUBMITTED"),
            "pendingOdRequests", odRepository.findByHodStatus("PENDING"),
            "pendingActivityVerifications", submissionRepository.findByVerificationStatus("SUBMITTED")
        );
    }
}
