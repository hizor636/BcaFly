package com.bcafly.attendance;

import com.bcafly.academics.SectionRepository;
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

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceSessionRepository sessionRepository;
    private final StudentAttendanceRepository attendanceRepository;
    private final FacultyProfileRepository facultyRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    private final SemesterRepository semesterRepository;
    private final StudentProfileRepository studentRepository;

    public AttendanceController(AttendanceSessionRepository sessionRepository,
                                StudentAttendanceRepository attendanceRepository,
                                FacultyProfileRepository facultyRepository,
                                SubjectRepository subjectRepository,
                                SectionRepository sectionRepository,
                                SemesterRepository semesterRepository,
                                StudentProfileRepository studentRepository) {
        this.sessionRepository = sessionRepository;
        this.attendanceRepository = attendanceRepository;
        this.facultyRepository = facultyRepository;
        this.subjectRepository = subjectRepository;
        this.sectionRepository = sectionRepository;
        this.semesterRepository = semesterRepository;
        this.studentRepository = studentRepository;
    }

    @PostMapping("/session")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<?> recordAttendanceSession(@RequestBody SessionEntryRequest req) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        FacultyProfile faculty = facultyRepository.findByUserId(currentUser.getId()).orElse(null);

        AttendanceSession session = new AttendanceSession();
        if (faculty != null) {
            session.setFaculty(faculty);
        } else if (req.facultyId() != null) {
            facultyRepository.findById(req.facultyId()).ifPresent(session::setFaculty);
        }

        subjectRepository.findById(req.subjectId()).ifPresent(session::setSubject);
        sectionRepository.findById(req.sectionId()).ifPresent(session::setSection);
        semesterRepository.findById(req.semesterId()).ifPresent(session::setSemester);
        session.setSessionDate(req.sessionDate() != null ? req.sessionDate() : LocalDate.now());
        session.setPeriodNumber(req.periodNumber() != null ? req.periodNumber() : 1);
        session.setTopic(req.topic());
        session.setStatus("SUBMITTED");
        sessionRepository.save(session);

        List<StudentAttendance> attendanceRecords = new ArrayList<>();
        if (req.records() != null) {
            for (StudentAttendanceEntry entry : req.records()) {
                StudentProfile student = studentRepository.findById(entry.studentId()).orElse(null);
                if (student != null) {
                    StudentAttendance sa = new StudentAttendance();
                    sa.setSession(session);
                    sa.setStudent(student);
                    sa.setIsPresent(entry.isPresent());
                    sa.setIsOd(entry.isOd());
                    sa.setRemarks(entry.remarks());
                    attendanceRecords.add(sa);
                }
            }
            attendanceRepository.saveAll(attendanceRecords);
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "session", session,
            "recordedStudents", attendanceRecords.size()
        ));
    }

    @GetMapping("/session/{sessionId}/records")
    public List<StudentAttendance> getSessionRecords(@PathVariable Long sessionId) {
        return attendanceRepository.findBySessionId(sessionId);
    }

    public record SessionEntryRequest(Long facultyId, Long subjectId, Long sectionId, Long semesterId,
                                      LocalDate sessionDate, Integer periodNumber, String topic,
                                      List<StudentAttendanceEntry> records) {}

    public record StudentAttendanceEntry(Long studentId, boolean isPresent, boolean isOd, String remarks) {}
}
