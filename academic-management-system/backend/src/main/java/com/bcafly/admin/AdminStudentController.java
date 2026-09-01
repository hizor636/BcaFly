package com.bcafly.admin;

import com.bcafly.common.AuditService;
import com.bcafly.students.Student;
import com.bcafly.students.StudentEnrolment;
import com.bcafly.students.StudentEnrolmentRepository;
import com.bcafly.students.StudentRepository;
import org.apache.poi.ss.usermodel.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/students")
@PreAuthorize("hasRole('ADMIN')")
@SuppressWarnings("null")
public class AdminStudentController {

    private final StudentRepository studentRepository;
    private final StudentEnrolmentRepository studentEnrolmentRepository;
    private final AuditService auditService;

    // Cache for storing preview rows before confirmation
    private final Map<String, List<Map<String, Object>>> importCache = new ConcurrentHashMap<>();
    private final Map<String, String> fileNameCache = new ConcurrentHashMap<>();

    public AdminStudentController(StudentRepository studentRepository,
                                  StudentEnrolmentRepository studentEnrolmentRepository,
                                  AuditService auditService) {
        this.studentRepository = studentRepository;
        this.studentEnrolmentRepository = studentEnrolmentRepository;
        this.auditService = auditService;
    }

    /**
     * GET /api/admin/students/enrolments?semesterId=6&academicYearId=2024-25-even
     */
    @GetMapping("/enrolments")
    public ResponseEntity<?> listEnrolments(
            @RequestParam("semesterId") Integer semesterId,
            @RequestParam("academicYearId") String academicYearId,
            @RequestParam(value = "section", required = false) String section) {

        if (semesterId == null || semesterId < 1 || semesterId > 6) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "A valid semester between 1 and 6 is required."));
        }

        List<StudentEnrolment> enrolments;
        if (section != null && !section.equalsIgnoreCase("ALL") && !section.equalsIgnoreCase("All Sections")) {
            enrolments = studentEnrolmentRepository.findBySemesterIdAndAcademicYearIdAndSectionAndEnrolmentStatus(
                    semesterId, academicYearId, section.toUpperCase(), "ACTIVE");
        } else {
            enrolments = studentEnrolmentRepository.findBySemesterIdAndAcademicYearIdAndEnrolmentStatus(
                    semesterId, academicYearId, "ACTIVE");
        }

        List<Map<String, Object>> result = enrolments.stream().map(e -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", e.getId());
            map.put("studentId", e.getStudent() != null ? e.getStudent().getId() : null);
            map.put("usn", e.getUsn());
            map.put("reg", e.getUsn());
            map.put("name", e.getStudent() != null ? e.getStudent().getFullName() : "Unknown");
            map.put("email", e.getStudent() != null ? e.getStudent().getEmail() : null);
            map.put("phone", e.getStudent() != null ? e.getStudent().getPhone() : null);
            map.put("semesterId", e.getSemesterId());
            map.put("academicYearId", e.getAcademicYearId());
            map.put("section", e.getSection());
            map.put("batch", e.getBatch());
            map.put("rollNumber", e.getRollNumber());
            map.put("enrolmentStatus", e.getEnrolmentStatus());
            map.put("attendance", e.getAttendancePercentage());
            map.put("attendancePercentage", e.getAttendancePercentage());
            map.put("sgpa", e.getCurrentSgpa());
            map.put("currentSgpa", e.getCurrentSgpa());
            map.put("standing", e.getStanding());
            map.put("resultStatus", e.getStanding());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "data", result, "count", result.size()));
    }

    /**
     * POST /api/admin/students/enrolments
     */
    @PostMapping("/enrolments")
    @Transactional
    public ResponseEntity<?> addEnrolment(@RequestBody Map<String, Object> payload) {
        Integer semesterId = payload.get("semesterId") != null ? Integer.parseInt(payload.get("semesterId").toString()) : null;
        String academicYearId = (String) payload.get("academicYearId");

        if (semesterId == null || semesterId < 1 || semesterId > 6) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "A valid semester is required for student enrolment."));
        }
        if (academicYearId == null || academicYearId.isBlank()) {
            academicYearId = "2024-25-even";
        }

        String usn = (String) (payload.get("usn") != null ? payload.get("usn") : payload.get("reg"));
        String name = (String) (payload.get("name") != null ? payload.get("name") : payload.get("fullName"));
        String section = payload.get("section") != null ? payload.get("section").toString().toUpperCase() : "A";
        String batch = payload.get("batch") != null ? payload.get("batch").toString() : "2024–27";
        String email = (String) payload.get("email");
        String phone = (String) payload.get("phone");

        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Student name is required."));
        }

        if (usn == null || usn.isBlank()) {
            usn = "1BC24" + String.format("%03d", (int) (Math.random() * 900) + 100);
        } else {
            usn = usn.trim().toUpperCase();
        }

        // Check if enrolment already exists in this semester workspace
        if (studentEnrolmentRepository.existsBySemesterIdAndAcademicYearIdAndUsn(semesterId, academicYearId, usn)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Student with USN " + usn + " is already enrolled in Semester " + semesterId));
        }

        // Create or find master Student identity
        String finalUsn = usn;
        Student student = studentRepository.findByUsn(finalUsn).orElseGet(() -> {
            Student s = new Student();
            s.setId("STU-" + UUID.randomUUID().toString());
            s.setUsn(finalUsn);
            s.setFullName(name.trim());
            s.setEmail(email);
            s.setPhone(phone);
            return studentRepository.save(s);
        });

        // Create Enrolment
        StudentEnrolment enrolment = new StudentEnrolment();
        enrolment.setId("ENR-" + UUID.randomUUID().toString());
        enrolment.setStudent(student);
        enrolment.setUsn(usn);
        enrolment.setSemesterId(semesterId);
        enrolment.setAcademicYearId(academicYearId);
        enrolment.setSection(section);
        enrolment.setBatch(batch);
        enrolment.setEnrolmentStatus("ACTIVE");
        enrolment.setAttendancePercentage(payload.get("attendance") != null ? new BigDecimal(payload.get("attendance").toString()) : BigDecimal.valueOf(90.0));
        enrolment.setCurrentSgpa(payload.get("sgpa") != null ? new BigDecimal(payload.get("sgpa").toString()) : BigDecimal.valueOf(8.5));
        enrolment.setStanding(payload.get("standing") != null ? payload.get("standing").toString() : "PASS");

        StudentEnrolment saved = studentEnrolmentRepository.save(enrolment);

        auditService.log("STUDENT_ADDED", "StudentEnrolment", null,
                String.format("Enrolled student %s (%s) into Semester %d (%s)", name, usn, semesterId, academicYearId));

        return ResponseEntity.ok(Map.of("success", true, "message", "Student enrolled successfully.", "data", saved));
    }

    /**
     * PATCH /api/admin/students/enrolments/{enrolmentId}
     */
    @PatchMapping("/enrolments/{enrolmentId}")
    @Transactional
    public ResponseEntity<?> updateEnrolment(
            @PathVariable String enrolmentId,
            @RequestBody Map<String, Object> payload) {

        Integer semesterId = payload.get("semesterId") != null ? Integer.parseInt(payload.get("semesterId").toString()) : null;
        String academicYearId = (String) payload.get("academicYearId");

        Optional<StudentEnrolment> enrolmentOpt;
        if (semesterId != null && academicYearId != null) {
            enrolmentOpt = studentEnrolmentRepository.findByIdAndSemesterIdAndAcademicYearId(enrolmentId, semesterId, academicYearId);
        } else {
            enrolmentOpt = studentEnrolmentRepository.findById(enrolmentId);
        }

        if (enrolmentOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Student enrolment was not found in the selected semester."
            ));
        }

        StudentEnrolment enrolment = enrolmentOpt.get();

        if (payload.containsKey("section") && payload.get("section") != null) {
            enrolment.setSection(payload.get("section").toString().toUpperCase());
        }
        if (payload.containsKey("batch") && payload.get("batch") != null) {
            enrolment.setBatch(payload.get("batch").toString());
        }
        if (payload.containsKey("rollNumber") && payload.get("rollNumber") != null) {
            enrolment.setRollNumber(Integer.parseInt(payload.get("rollNumber").toString()));
        }
        if (payload.containsKey("attendance") || payload.containsKey("attendancePercentage")) {
            Object att = payload.getOrDefault("attendancePercentage", payload.get("attendance"));
            if (att != null) enrolment.setAttendancePercentage(new BigDecimal(att.toString()));
        }
        if (payload.containsKey("sgpa") || payload.containsKey("currentSgpa")) {
            Object sgpa = payload.getOrDefault("currentSgpa", payload.get("sgpa"));
            if (sgpa != null) enrolment.setCurrentSgpa(new BigDecimal(sgpa.toString()));
        }
        if (payload.containsKey("standing") && payload.get("standing") != null) {
            enrolment.setStanding(payload.get("standing").toString());
        }
        if (payload.containsKey("enrolmentStatus") && payload.get("enrolmentStatus") != null) {
            enrolment.setEnrolmentStatus(payload.get("enrolmentStatus").toString().toUpperCase());
        }

        StudentEnrolment updated = studentEnrolmentRepository.save(enrolment);

        auditService.log("STUDENT_UPDATED", "StudentEnrolment", null,
                "Updated enrolment " + enrolmentId + " for student " + enrolment.getUsn() + " in semester " + enrolment.getSemesterId());

        return ResponseEntity.ok(Map.of("success", true, "message", "Enrolment updated successfully.", "data", updated));
    }

    /**
     * DELETE /api/admin/students/enrolments/{enrolmentId}
     */
    @DeleteMapping("/enrolments/{enrolmentId}")
    @Transactional
    public ResponseEntity<?> deleteEnrolment(
            @PathVariable String enrolmentId,
            @RequestParam(value = "semesterId", required = false) Integer semesterId,
            @RequestParam(value = "academicYearId", required = false) String academicYearId) {

        Optional<StudentEnrolment> enrolmentOpt;
        if (semesterId != null && academicYearId != null) {
            enrolmentOpt = studentEnrolmentRepository.findByIdAndSemesterIdAndAcademicYearId(enrolmentId, semesterId, academicYearId);
        } else {
            enrolmentOpt = studentEnrolmentRepository.findById(enrolmentId);
        }

        if (enrolmentOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Student enrolment was not found in the selected semester."
            ));
        }

        StudentEnrolment enrolment = enrolmentOpt.get();
        enrolment.setEnrolmentStatus("DROPPED");
        studentEnrolmentRepository.save(enrolment);

        auditService.log("STUDENT_REMOVED", "StudentEnrolment", null,
                "Deactivated enrolment " + enrolmentId + " (" + enrolment.getUsn() + ") from semester " + enrolment.getSemesterId());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Student enrolment dropped from Semester " + enrolment.getSemesterId()
        ));
    }

    /**
     * POST /api/admin/students/import/preview
     */
    @PostMapping(value = "/import/preview", consumes = "multipart/form-data")
    public ResponseEntity<?> importPreview(
            @RequestParam("file") MultipartFile file,
            @RequestParam("semesterId") Integer semesterId,
            @RequestParam("academicYearId") String academicYearId) {

        if (semesterId == null || semesterId < 1 || semesterId > 6) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "A valid semester between 1 and 6 is required."));
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Please select a CSV, XLS, or XLSX document."));
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || (!originalName.endsWith(".csv") && !originalName.endsWith(".xlsx") && !originalName.endsWith(".xls"))) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Please select a CSV, XLS, or XLSX document."));
        }

        try {
            List<Map<String, String>> rawRows = parseFile(file);
            if (rawRows.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "The document must not be empty."));
            }

            Set<String> headers = rawRows.get(0).keySet();
            String usnHeader = matchHeader(headers, "USN / Register Number", "Register Number", "Reg No", "USN", "Reg. No / USN", "RegNo");
            String nameHeader = matchHeader(headers, "Student Name", "FullName", "Name", "Full Name");
            String sectionHeader = matchHeader(headers, "Section", "Sec");
            String batchHeader = matchHeader(headers, "Batch");
            String emailHeader = matchHeader(headers, "Email", "Email Address");
            String phoneHeader = matchHeader(headers, "Phone", "Mobile", "Contact");
            String attHeader = matchHeader(headers, "Attendance Percentage", "Attendance %", "Attendance", "Att");
            String sgpaHeader = matchHeader(headers, "Current SGPA", "SGPA", "CGPA");
            String standingHeader = matchHeader(headers, "Standing", "Result Status", "Status");

            if (usnHeader == null || nameHeader == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Missing required columns: USN/Register Number and Student Name are mandatory."
                ));
            }

            List<Map<String, Object>> previewRows = new ArrayList<>();
            List<Map<String, Object>> validRowsForImport = new ArrayList<>();
            Set<String> seenUsns = new HashSet<>();

            int totalRows = 0;
            int readyCount = 0;
            int warningCount = 0;
            int errorCount = 0;
            int newCount = 0;
            int updateCount = 0;

            for (int i = 0; i < rawRows.size(); i++) {
                totalRows++;
                Map<String, String> row = rawRows.get(i);
                String rawUsn = row.get(usnHeader);
                String rawName = row.get(nameHeader);
                String rawSection = sectionHeader != null ? row.get(sectionHeader) : "A";
                String rawBatch = batchHeader != null ? row.get(batchHeader) : "2024–27";
                String rawEmail = emailHeader != null ? row.get(emailHeader) : null;
                String rawPhone = phoneHeader != null ? row.get(phoneHeader) : null;
                String rawAtt = attHeader != null ? row.get(attHeader) : "90";
                String rawSgpa = sgpaHeader != null ? row.get(sgpaHeader) : "8.5";
                String rawStanding = standingHeader != null ? row.get(standingHeader) : "PASS";

                List<String> errors = new ArrayList<>();
                List<String> warnings = new ArrayList<>();
                if (rawUsn == null || rawUsn.isBlank()) errors.add("USN/Register Number is required.");
                if (rawName == null || rawName.isBlank()) errors.add("Student Name is required.");

                String upperUsn = rawUsn != null ? rawUsn.trim().toUpperCase() : "";
                if (!upperUsn.isEmpty()) {
                    if (seenUsns.contains(upperUsn)) {
                        errors.add("Duplicate USN in uploaded file: " + upperUsn);
                    } else {
                        seenUsns.add(upperUsn);
                    }

                    // Check duplicate in database for this active semester workspace
                    boolean exists = studentEnrolmentRepository.existsBySemesterIdAndAcademicYearIdAndUsn(semesterId, academicYearId, upperUsn);
                    if (exists) {
                        warnings.add("Student already enrolled in Semester (" + upperUsn + "). Existing record will be updated.");
                        updateCount++;
                    } else {
                        newCount++;
                    }
                }

                String cleanSec = "A";
                if (rawSection != null && !rawSection.isBlank()) {
                    String norm = rawSection.trim().toUpperCase().replace("SECTION", "").replace("SEC", "").trim();
                    if (norm.equals("A") || norm.equals("B") || norm.equals("C")) {
                        cleanSec = norm;
                    } else {
                        warnings.add("Unrecognized section \"" + rawSection + "\". Defaulted to Section A.");
                    }
                }

                Map<String, Object> previewRow = new LinkedHashMap<>();
                previewRow.put("rowIndex", i + 1);
                previewRow.put("usn", upperUsn);
                previewRow.put("reg", upperUsn);
                previewRow.put("name", rawName != null ? rawName.trim() : "");
                previewRow.put("section", cleanSec);
                previewRow.put("batch", rawBatch != null ? rawBatch.trim() : "2024–27");
                previewRow.put("email", rawEmail != null ? rawEmail.trim() : "");
                previewRow.put("phone", rawPhone != null ? rawPhone.trim() : "");
                previewRow.put("attendance", rawAtt != null ? rawAtt.trim() : "90");
                previewRow.put("sgpa", rawSgpa != null ? rawSgpa.trim() : "8.5");
                previewRow.put("standing", rawStanding != null ? rawStanding.trim() : "PASS");

                if (!errors.isEmpty()) {
                    previewRow.put("errors", errors);
                    previewRow.put("status", "error");
                    errorCount++;
                } else if (!warnings.isEmpty()) {
                    previewRow.put("warnings", warnings);
                    previewRow.put("status", "warning");
                    warningCount++;
                    readyCount++;
                    validRowsForImport.add(previewRow);
                } else {
                    previewRow.put("status", "ready");
                    readyCount++;
                    validRowsForImport.add(previewRow);
                }

                previewRows.add(previewRow);
            }

            String uploadId = "STU-UP-" + UUID.randomUUID().toString();
            importCache.put(uploadId, validRowsForImport);
            fileNameCache.put(uploadId, originalName);

            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("totalRows", totalRows);
            stats.put("validCount", readyCount);
            stats.put("warningCount", warningCount);
            stats.put("errorCount", errorCount);
            stats.put("newCount", newCount);
            stats.put("updateCount", updateCount);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "uploadId", uploadId,
                    "semesterId", semesterId,
                    "academicYearId", academicYearId,
                    "stats", stats,
                    "rows", previewRows
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to parse spreadsheet: " + e.getMessage()));
        }
    }

    /**
     * POST /api/admin/students/import/confirm
     */
    @PostMapping("/import/confirm")
    @Transactional
    public ResponseEntity<?> importConfirm(@RequestBody Map<String, Object> payload) {
        String uploadId = (String) payload.get("uploadId");
        Integer semesterId = (Integer) payload.get("semesterId");
        String academicYearId = (String) payload.get("academicYearId");
        String mode = (String) payload.get("mode"); // "merge" | "add-only" | "replace-semester"

        if (semesterId == null || semesterId < 1 || semesterId > 6) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "A valid semester between 1 and 6 is required."));
        }

        if (uploadId == null || !importCache.containsKey(uploadId)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid or expired import session."));
        }

        List<Map<String, Object>> validRows = importCache.remove(uploadId);
        String originalFileName = fileNameCache.remove(uploadId);

        if (validRows == null || validRows.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No valid records to import."));
        }

        if ("replace-semester".equalsIgnoreCase(mode)) {
            studentEnrolmentRepository.deleteBySemesterIdAndAcademicYearId(semesterId, academicYearId);
        }

        int importedCount = 0;
        for (Map<String, Object> r : validRows) {
            String usn = (String) r.get("usn");
            String name = (String) r.get("name");
            String section = (String) r.get("section");
            String batch = (String) r.get("batch");
            String email = (String) r.get("email");
            String phone = (String) r.get("phone");

            Optional<StudentEnrolment> existing = studentEnrolmentRepository.findBySemesterIdAndAcademicYearIdAndUsn(
                    semesterId, academicYearId, usn);

            if ("add-only".equalsIgnoreCase(mode) && existing.isPresent()) {
                continue; // Skip existing in add-only mode
            }

            // Create or update master student
            Student student = studentRepository.findByUsn(usn).orElseGet(() -> {
                Student s = new Student();
                s.setId("STU-" + UUID.randomUUID().toString());
                s.setUsn(usn);
                s.setFullName(name);
                s.setEmail(email);
                s.setPhone(phone);
                return studentRepository.save(s);
            });

            StudentEnrolment enrolment;
            if (existing.isPresent()) {
                enrolment = existing.get();
                enrolment.setSection(section);
                enrolment.setBatch(batch);
                enrolment.setEnrolmentStatus("ACTIVE");
            } else {
                enrolment = new StudentEnrolment();
                enrolment.setId("ENR-" + UUID.randomUUID().toString());
                enrolment.setStudent(student);
                enrolment.setUsn(usn);
                enrolment.setSemesterId(semesterId);
                enrolment.setAcademicYearId(academicYearId);
                enrolment.setSection(section);
                enrolment.setBatch(batch);
                enrolment.setEnrolmentStatus("ACTIVE");
                enrolment.setAttendancePercentage(new BigDecimal(r.getOrDefault("attendance", "90").toString()));
                enrolment.setCurrentSgpa(new BigDecimal(r.getOrDefault("sgpa", "8.5").toString()));
                enrolment.setStanding((String) r.getOrDefault("standing", "PASS"));
            }

            studentEnrolmentRepository.save(enrolment);
            importedCount++;
        }

        auditService.log("STUDENT_DOCUMENT_IMPORTED", "StudentEnrolment", null,
                String.format("Imported %d students into Semester %d (%s) from file %s (mode: %s)",
                        importedCount, semesterId, academicYearId, originalFileName, mode));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Successfully imported " + importedCount + " students into Semester " + semesterId + "."
        ));
    }

    /**
     * GET /api/admin/students/template
     */
    @GetMapping({"/template", "/import-template"})
    public ResponseEntity<String> getTemplate(@RequestParam(value = "semesterId", required = false) Integer semesterId) {
        int sem = semesterId != null ? semesterId : 6;
        String csv = "USN / Register Number,Student Name,Section,Batch,Email,Phone,Attendance Percentage,Current SGPA,Standing\n"
                + "1BC24001,Aakash Sharma,A,2024–27,aakash@example.com,9876543210,92.5,8.8,PASS\n"
                + "1BC24002,Bhavana Reddy,A,2024–27,bhavana@example.com,9876543211,88.0,8.4,PASS\n"
                + "1BC24003,Chetan Kumar,B,2024–27,chetan@example.com,9876543212,79.5,7.9,PASS\n";

        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=semester_" + sem + "_student_template.csv")
                .body(csv);
    }

    private List<Map<String, String>> parseFile(MultipartFile file) throws Exception {
        List<Map<String, String>> rows = new ArrayList<>();
        String originalName = file.getOriginalFilename();

        if (originalName != null && (originalName.endsWith(".xlsx") || originalName.endsWith(".xls"))) {
            try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
                Sheet sheet = workbook.getSheetAt(0);
                Row headerRow = null;

                for (int r = 0; r <= sheet.getLastRowNum(); r++) {
                    Row row = sheet.getRow(r);
                    if (row != null && getNonEmptyCellCount(row) > 0) {
                        headerRow = row;
                        break;
                    }
                }

                if (headerRow == null) throw new IllegalArgumentException("No header row detected in document.");

                List<String> headers = new ArrayList<>();
                for (int c = 0; c < headerRow.getLastCellNum(); c++) {
                    headers.add(getCellValueAsString(headerRow.getCell(c)).trim());
                }

                int headerIdx = headerRow.getRowNum();
                for (int r = headerIdx + 1; r <= sheet.getLastRowNum(); r++) {
                    Row row = sheet.getRow(r);
                    if (row == null || getNonEmptyCellCount(row) == 0) continue;

                    Map<String, String> rowMap = new LinkedHashMap<>();
                    for (int c = 0; c < headers.size(); c++) {
                        String h = headers.get(c);
                        if (h.isEmpty()) continue;
                        rowMap.put(h, getCellValueAsString(row.getCell(c)).trim());
                    }
                    rows.add(rowMap);
                }
            }
        } else {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
                String headerLine = reader.readLine();
                if (headerLine == null || headerLine.isBlank()) throw new IllegalArgumentException("File is empty.");

                String[] headers = headerLine.split(",");
                for (int i = 0; i < headers.length; i++) headers[i] = headers[i].trim();

                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.isBlank()) continue;
                    String[] cols = line.split(",", -1);
                    Map<String, String> rowMap = new LinkedHashMap<>();
                    for (int c = 0; c < headers.length; c++) {
                        if (headers[c].isEmpty()) continue;
                        rowMap.put(headers[c], c < cols.length ? cols[c].trim() : "");
                    }
                    rows.add(rowMap);
                }
            }
        }
        return rows;
    }

    private int getNonEmptyCellCount(Row row) {
        int count = 0;
        for (int c = 0; c < row.getLastCellNum(); c++) {
            if (!getCellValueAsString(row.getCell(c)).trim().isEmpty()) count++;
        }
        return count;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) return cell.getDateCellValue().toString();
                double val = cell.getNumericCellValue();
                return val == (long) val ? String.format("%d", (long) val) : String.format("%s", val);
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default: return "";
        }
    }

    private String matchHeader(Set<String> headers, String... possibleHeaders) {
        for (String possible : possibleHeaders) {
            for (String h : headers) {
                if (h.equalsIgnoreCase(possible) ||
                        h.toLowerCase().replace(" ", "").replace("_", "").replace("/", "").equals(
                                possible.toLowerCase().replace(" ", "").replace("_", "").replace("/", ""))) {
                    return h;
                }
            }
        }
        return null;
    }
}
