package com.bcafly.students;

import com.bcafly.academics.SectionRepository;
import com.bcafly.academics.SemesterRepository;
import com.bcafly.attendance.StudentAttendanceRepository;
import com.bcafly.marks.InternalMarkRepository;
import com.bcafly.users.User;
import com.bcafly.users.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentProfileRepository studentRepository;
    private final UserRepository userRepository;
    private final SemesterRepository semesterRepository;
    private final SectionRepository sectionRepository;
    private final StudentAttendanceRepository attendanceRepository;
    private final InternalMarkRepository internalMarkRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentController(StudentProfileRepository studentRepository,
                             UserRepository userRepository,
                             SemesterRepository semesterRepository,
                             SectionRepository sectionRepository,
                             StudentAttendanceRepository attendanceRepository,
                             InternalMarkRepository internalMarkRepository,
                             PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.semesterRepository = semesterRepository;
        this.sectionRepository = sectionRepository;
        this.attendanceRepository = attendanceRepository;
        this.internalMarkRepository = internalMarkRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<StudentProfile> getAllStudents(@RequestParam(required = false) Long semesterId,
                                              @RequestParam(required = false) Long sectionId) {
        if (semesterId != null && sectionId != null) {
            return studentRepository.findByCurrentSemesterIdAndSectionId(semesterId, sectionId);
        }
        if (semesterId != null) {
            return studentRepository.findByCurrentSemesterId(semesterId);
        }
        return studentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable Long id) {
        return studentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createStudent(@RequestBody CreateStudentRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }

        User user = User.builder()
                .name(req.name())
                .email(req.email())
                .passwordHash(passwordEncoder.encode("Password@123"))
                .role(User.Role.STUDENT)
                .department("BCA")
                .isActive(true)
                .build();
        userRepository.save(user);

        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setRegNo(req.regNo());
        profile.setRollNo(req.rollNo());
        if (req.semesterId() != null) {
            semesterRepository.findById(req.semesterId()).ifPresent(profile::setCurrentSemester);
        }
        if (req.sectionId() != null) {
            sectionRepository.findById(req.sectionId()).ifPresent(profile::setSection);
        }
        profile.setCgpa(BigDecimal.ZERO);
        profile.setAttendancePct(BigDecimal.ZERO);
        studentRepository.save(profile);

        return ResponseEntity.ok(profile);
    }

    @GetMapping("/me/portfolio-stats")
    public ResponseEntity<?> getMyPortfolioStats() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User currentUser)) {
            return ResponseEntity.status(401).build();
        }

        StudentProfile profile = studentRepository.findByUserId(currentUser.getId()).orElse(null);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }

        long total = attendanceRepository.countTotalByStudent(profile.getId());
        long present = attendanceRepository.countPresentByStudent(profile.getId());
        BigDecimal calculatedAtt = total > 0
                ? BigDecimal.valueOf((double) present / total * 100).setScale(2, RoundingMode.HALF_UP)
                : profile.getAttendancePct();

        Map<String, Object> stats = new HashMap<>();
        stats.put("student", profile);
        stats.put("totalClasses", total);
        stats.put("attendedClasses", present);
        stats.put("attendancePercentage", calculatedAtt);
        stats.put("cgpa", profile.getCgpa());
        stats.put("riskStatus", profile.getRiskStatus());
        stats.put("internalMarks", internalMarkRepository.findByStudentId(profile.getId()));

        return ResponseEntity.ok(stats);
    }

    public record CreateStudentRequest(String name, String email, String regNo, String rollNo, Long semesterId, Long sectionId) {}
}
