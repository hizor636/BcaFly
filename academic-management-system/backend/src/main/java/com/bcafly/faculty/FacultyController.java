package com.bcafly.faculty;

import com.bcafly.academics.FacultyAssignment;
import com.bcafly.academics.FacultyAssignmentRepository;
import com.bcafly.users.User;
import com.bcafly.users.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty")
@SuppressWarnings("all")
public class FacultyController {

    private final FacultyProfileRepository facultyRepository;
    private final FacultyAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public FacultyController(FacultyProfileRepository facultyRepository,
                             FacultyAssignmentRepository assignmentRepository,
                             UserRepository userRepository,
                             PasswordEncoder passwordEncoder) {
        this.facultyRepository = facultyRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<FacultyProfile> getAllFaculty() {
        return facultyRepository.findAll();
    }

    @GetMapping("/me/assignments")
    public ResponseEntity<?> getMyAssignments() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User currentUser)) {
            return ResponseEntity.status(401).build();
        }

        FacultyProfile profile = facultyRepository.findByUserId(currentUser.getId()).orElse(null);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }

        List<FacultyAssignment> assignments = assignmentRepository.findByFacultyId(profile.getId());
        return ResponseEntity.ok(Map.of(
            "faculty", profile,
            "assignments", assignments
        ));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createFaculty(@RequestBody CreateFacultyRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }

        User user = User.builder()
                .name(req.name())
                .email(req.email())
                .passwordHash(passwordEncoder.encode("Password@123"))
                .role(User.Role.FACULTY)
                .department("BCA")
                .isActive(true)
                .build();
        userRepository.save(user);

        FacultyProfile profile = new FacultyProfile();
        profile.setUser(user);
        profile.setEmployeeCode(req.employeeCode());
        profile.setDesignation(req.designation() != null ? req.designation() : "Assistant Professor");
        profile.setDepartment("BCA");
        profile.setPhone(req.phone());
        facultyRepository.save(profile);

        return ResponseEntity.ok(profile);
    }

    public record CreateFacultyRequest(String name, String email, String employeeCode, String designation, String phone) {}
}
