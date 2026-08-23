package com.bcafly.admin;

import com.bcafly.common.AuditService;
import com.bcafly.common.ScopeValidator;
import com.bcafly.students.StudentProfile;
import com.bcafly.students.StudentProfileRepository;
import com.bcafly.users.User;
import com.bcafly.users.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Admin Student Management Controller.
 *
 * Handles student profile CRUD and CSV import with validation,
 * preview, error reporting, and audit logging.
 */
@RestController
@RequestMapping("/api/admin/students")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentController {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final ScopeValidator scopeValidator;

    public AdminStudentController(UserRepository userRepository,
                                  StudentProfileRepository studentProfileRepository,
                                  PasswordEncoder passwordEncoder,
                                  AuditService auditService,
                                  ScopeValidator scopeValidator) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.scopeValidator = scopeValidator;
    }

    /**
     * GET /api/admin/students
     * List all students, optionally filtered by workspace, section, semester.
     */
    @GetMapping
    public ResponseEntity<?> listStudents(
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) Long sectionId,
            @RequestParam(required = false) Integer semester) {

        List<StudentProfile> students;
        if (sectionId != null) {
            students = studentProfileRepository.findBySectionId(sectionId);
        } else if (semester != null) {
            students = studentProfileRepository.findByCurrentSemesterId(Long.valueOf(semester));
        } else {
            students = studentProfileRepository.findAll();
        }

        List<Map<String, Object>> result = students.stream().map(s -> {
            User user = s.getUser();
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", s.getId());
            map.put("userId", user != null ? user.getId() : null);
            map.put("registerNumber", s.getRegNo());
            map.put("rollNumber", s.getRollNo());
            map.put("fullName", user != null ? user.getName() : "Unknown");
            map.put("email", user != null ? user.getEmail() : null);
            map.put("semesterId", s.getCurrentSemesterId());
            map.put("sectionId", s.getSectionId());
            map.put("cgpa", s.getCgpa());
            map.put("attendancePct", s.getAttendancePct());
            map.put("riskStatus", s.getRiskStatus());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "data", result, "count", result.size()));
    }

    /**
     * POST /api/admin/students
     * Create a single student profile with a user account.
     */
    @PostMapping
    public ResponseEntity<?> createStudent(@RequestBody CreateStudentRequest request) {
        // Validate uniqueness
        if (userRepository.existsByEmail(request.email())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email already exists: " + request.email()));
        }
        if (studentProfileRepository.existsByRegNo(request.registerNumber())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Register number already exists: " + request.registerNumber()));
        }

        // Create user account
        User user = User.builder()
                .name(request.fullName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode("Student@123"))
                .role(User.Role.STUDENT)
                .department("BCA")
                .isActive(true)
                .build();
        userRepository.save(user);

        // Create student profile
        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setRegNo(request.registerNumber());
        profile.setRollNo(request.rollNumber());
        studentProfileRepository.save(profile);

        auditService.log("STUDENT_CREATED", "StudentProfile", profile.getId(),
                "Created student " + request.fullName() + " (" + request.registerNumber() + ")");

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Student " + request.fullName() + " enrolled successfully.",
                "studentId", profile.getId(),
                "userId", user.getId(),
                "temporaryPassword", "Student@123"
        ));
    }

    /**
     * POST /api/admin/students/import
     * Upload CSV file, validate, and return a preview with errors.
     * Does NOT commit to database — use /import/{jobId}/confirm for that.
     */
    @PostMapping("/import")
    public ResponseEntity<?> importStudentsPreview(@RequestParam("file") MultipartFile file,
                                                   @RequestParam(value = "workspaceId", required = false) Long workspaceId) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No file uploaded."));
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || (!fileName.endsWith(".csv") && !fileName.endsWith(".CSV"))) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Only CSV files are supported. Received: " + fileName));
        }

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null || headerLine.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "CSV file is empty or missing header row."));
            }

            String[] headers = headerLine.split(",");
            Map<String, Integer> columnMap = new LinkedHashMap<>();
            for (int i = 0; i < headers.length; i++) {
                columnMap.put(headers[i].trim().toLowerCase(), i);
            }

            // Required columns validation
            List<String> requiredColumns = List.of("registernumber", "fullname", "email");
            List<String> missingColumns = requiredColumns.stream()
                    .filter(c -> !columnMap.containsKey(c))
                    .collect(Collectors.toList());

            if (!missingColumns.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Missing required columns: " + String.join(", ", missingColumns),
                        "detectedColumns", columnMap.keySet()
                ));
            }

            // Parse and validate rows
            List<Map<String, Object>> validRows = new ArrayList<>();
            List<Map<String, Object>> errors = new ArrayList<>();
            Set<String> seenRegNos = new HashSet<>();
            Set<String> seenEmails = new HashSet<>();
            int rowNumber = 1;
            String line;

            while ((line = reader.readLine()) != null) {
                rowNumber++;
                if (line.isBlank()) continue;

                String[] cols = line.split(",", -1);
                String regNo = getColumn(cols, columnMap, "registernumber");
                String fullName = getColumn(cols, columnMap, "fullname");
                String email = getColumn(cols, columnMap, "email");
                String phone = getColumn(cols, columnMap, "phone");
                String section = getColumn(cols, columnMap, "section");
                String batch = getColumn(cols, columnMap, "batch");
                String semester = getColumn(cols, columnMap, "semester");

                List<String> rowErrors = new ArrayList<>();

                // Validate required fields
                if (regNo == null || regNo.isBlank()) rowErrors.add("Register number is required.");
                if (fullName == null || fullName.isBlank()) rowErrors.add("Full name is required.");
                if (email == null || email.isBlank()) rowErrors.add("Email is required.");

                // Validate uniqueness within file
                if (regNo != null && !regNo.isBlank()) {
                    if (seenRegNos.contains(regNo.toLowerCase())) {
                        rowErrors.add("Duplicate register number in file: " + regNo);
                    } else {
                        seenRegNos.add(regNo.toLowerCase());
                    }
                    // Check against database
                    if (studentProfileRepository.existsByRegNo(regNo)) {
                        rowErrors.add("Register number already exists in database: " + regNo);
                    }
                }

                if (email != null && !email.isBlank()) {
                    if (seenEmails.contains(email.toLowerCase())) {
                        rowErrors.add("Duplicate email in file: " + email);
                    } else {
                        seenEmails.add(email.toLowerCase());
                    }
                    if (userRepository.existsByEmail(email)) {
                        rowErrors.add("Email already exists in database: " + email);
                    }
                }

                Map<String, Object> row = new LinkedHashMap<>();
                row.put("rowNumber", rowNumber);
                row.put("registerNumber", regNo);
                row.put("fullName", fullName);
                row.put("email", email);
                row.put("phone", phone);
                row.put("section", section);
                row.put("batch", batch);
                row.put("semester", semester);

                if (!rowErrors.isEmpty()) {
                    row.put("errors", rowErrors);
                    errors.add(row);
                } else {
                    validRows.add(row);
                }
            }

            // Generate import job ID for confirmation step
            String importJobId = "IMP-" + System.currentTimeMillis();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "importJobId", importJobId,
                    "fileName", fileName,
                    "totalRows", validRows.size() + errors.size(),
                    "validRows", validRows.size(),
                    "errorRows", errors.size(),
                    "preview", validRows.stream().limit(20).collect(Collectors.toList()),
                    "errors", errors,
                    "status", errors.isEmpty() ? "READY_FOR_IMPORT" : "VALIDATION_FAILED",
                    "message", errors.isEmpty()
                            ? validRows.size() + " students ready for import."
                            : errors.size() + " rows have validation errors. Fix and re-upload."
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to process CSV: " + e.getMessage()
            ));
        }
    }

    /**
     * GET /api/admin/students/import-template
     * Returns a CSV template for student bulk upload.
     */
    @GetMapping("/import-template")
    public ResponseEntity<String> getImportTemplate() {
        String template = "registerNumber,admissionNumber,fullName,email,phone,department,program,academicYear,semester,section,batch,status\n"
                + "BCA26001,ADM2026001,Rahul Kumar,rahul@example.com,9876543210,BCA,BCA,2026-27,3,A,Batch-1,ACTIVE\n";

        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=bcafly_student_import_template.csv")
                .body(template);
    }

    private String getColumn(String[] cols, Map<String, Integer> columnMap, String key) {
        Integer idx = columnMap.get(key);
        if (idx == null || idx >= cols.length) return null;
        String val = cols[idx].trim();
        // Remove surrounding quotes
        if (val.startsWith("\"") && val.endsWith("\"")) {
            val = val.substring(1, val.length() - 1);
        }
        return val.isBlank() ? null : val;
    }

    public record CreateStudentRequest(
            String registerNumber,
            String rollNumber,
            String fullName,
            String email,
            String phone,
            String department,
            String program,
            Integer semester,
            String section,
            String batch
    ) {}
}
