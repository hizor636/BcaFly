package com.bcafly.admin;

import com.bcafly.academics.Subject;
import com.bcafly.academics.SubjectRepository;
import com.bcafly.common.AuditService;
import com.bcafly.faculty.FacultyCourseAssignment;
import com.bcafly.faculty.FacultyCourseAssignmentRepository;
import com.bcafly.faculty.FacultyMember;
import com.bcafly.faculty.FacultyMemberRepository;
import org.apache.poi.ss.usermodel.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/faculty")
@PreAuthorize("hasRole('ADMIN')")
@SuppressWarnings("null")
public class AdminFacultyController {

    private final FacultyMemberRepository facultyMemberRepository;
    private final FacultyCourseAssignmentRepository assignmentRepository;
    private final SubjectRepository subjectRepository;
    private final AuditService auditService;

    // Cache for pre-import validation sessions
    private final Map<String, List<Map<String, Object>>> importCache = new ConcurrentHashMap<>();
    private final Map<String, String> fileNameCache = new ConcurrentHashMap<>();

    public AdminFacultyController(FacultyMemberRepository facultyMemberRepository,
                                  FacultyCourseAssignmentRepository assignmentRepository,
                                  SubjectRepository subjectRepository,
                                  AuditService auditService) {
        this.facultyMemberRepository = facultyMemberRepository;
        this.assignmentRepository = assignmentRepository;
        this.subjectRepository = subjectRepository;
        this.auditService = auditService;
    }

    /**
     * GET /api/admin/faculty?semesterId=6&academicYearId=2024-25-even
     */
    @GetMapping
    public ResponseEntity<?> listFacultyWithWorkload(
            @RequestParam("semesterId") Integer semesterId,
            @RequestParam(value = "academicYearId", defaultValue = "2024-25-even") String academicYearId) {

        if (semesterId == null || semesterId < 1 || semesterId > 6) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "A valid semester between 1 and 6 is required."));
        }

        List<FacultyMember> facultyList = facultyMemberRepository.findByEmploymentStatus("ACTIVE");
        List<FacultyCourseAssignment> assignments = assignmentRepository.findBySemesterIdAndAcademicYearIdAndStatus(
                semesterId, academicYearId, "ACTIVE");

        Map<String, List<FacultyCourseAssignment>> assignmentMap = assignments.stream()
                .collect(Collectors.groupingBy(a -> a.getFaculty().getId()));

        List<Map<String, Object>> result = facultyList.stream().map(f -> {
            List<FacultyCourseAssignment> fa = assignmentMap.getOrDefault(f.getId(), Collections.emptyList());
            int totalCredits = fa.stream().mapToInt(FacultyCourseAssignment::getWeeklyTeachingCredits).sum();

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", f.getId());
            map.put("facultyCode", f.getFacultyCode());
            map.put("name", f.getFullName());
            map.put("fullName", f.getFullName());
            map.put("designation", f.getDesignation());
            map.put("role", f.getDesignation());
            map.put("dept", f.getDepartment());
            map.put("department", f.getDepartment());
            map.put("email", f.getEmail());
            map.put("phone", f.getPhone());
            map.put("status", f.getEmploymentStatus());
            map.put("assignedCourses", fa.stream().map(a -> {
                Map<String, Object> cMap = new LinkedHashMap<>();
                cMap.put("assignmentId", a.getId());
                cMap.put("courseId", a.getCourseId());
                cMap.put("courseCode", a.getCourseCode());
                cMap.put("code", a.getCourseCode());
                cMap.put("weeklyTeachingCredits", a.getWeeklyTeachingCredits());
                cMap.put("assignedRole", a.getAssignedRole());
                return cMap;
            }).collect(Collectors.toList()));
            map.put("courseCount", fa.size());
            map.put("totalCredits", totalCredits);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "data", result, "count", result.size()));
    }

    /**
     * POST /api/admin/faculty/assignments
     */
    @PostMapping("/assignments")
    @Transactional
    public ResponseEntity<?> assignFaculty(@RequestBody Map<String, Object> payload) {
        Integer semesterId = payload.get("semesterId") != null ? Integer.parseInt(payload.get("semesterId").toString()) : null;
        String academicYearId = (String) payload.getOrDefault("academicYearId", "2024-25-even");

        if (semesterId == null || semesterId < 1 || semesterId > 6) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "A valid semester between 1 and 6 is required."));
        }

        String facultyId = (String) payload.get("facultyId");
        String courseId = (String) payload.get("courseId");
        String courseCode = (String) payload.get("courseCode");
        Integer credits = payload.get("weeklyTeachingCredits") != null ? Integer.parseInt(payload.get("weeklyTeachingCredits").toString()) : 4;
        String assignedRole = payload.get("assignedRole") != null ? payload.get("assignedRole").toString().toUpperCase() : "PRIMARY";

        if (facultyId == null || facultyId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Faculty selection is required."));
        }
        if ((courseId == null || courseId.isBlank()) && (courseCode == null || courseCode.isBlank())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Course selection is required."));
        }

        FacultyMember faculty = facultyMemberRepository.findById(facultyId).orElse(null);
        if (faculty == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Faculty profile not found."));
        }

        // Validate course in active semester
        String targetCourseId = courseId != null ? courseId : courseCode;
        String targetCourseCode = courseCode != null ? courseCode.toUpperCase() : courseId;

        // Check if already assigned
        if (assignmentRepository.existsByFacultyIdAndCourseIdAndSemesterIdAndAcademicYearIdAndStatus(
                faculty.getId(), targetCourseId, semesterId, academicYearId, "ACTIVE")) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Faculty " + faculty.getFullName() + " is already assigned to course " + targetCourseCode + " in Semester " + semesterId
            ));
        }

        FacultyCourseAssignment assignment = new FacultyCourseAssignment();
        assignment.setId("ASG-" + UUID.randomUUID().toString());
        assignment.setFaculty(faculty);
        assignment.setCourseId(targetCourseId);
        assignment.setCourseCode(targetCourseCode);
        assignment.setSemesterId(semesterId);
        assignment.setAcademicYearId(academicYearId);
        assignment.setWeeklyTeachingCredits(credits);
        assignment.setAssignedRole(assignedRole);
        assignment.setStatus("ACTIVE");

        FacultyCourseAssignment saved = assignmentRepository.save(assignment);

        auditService.log("FACULTY_ASSIGNED", "FacultyCourseAssignment", null,
                String.format("Assigned %s to %s (%d credits/wk) in Semester %d (%s)",
                        faculty.getFullName(), targetCourseCode, credits, semesterId, academicYearId));

        return ResponseEntity.ok(Map.of("success", true, "message", "Faculty assigned successfully.", "data", saved));
    }

    /**
     * PATCH /api/admin/faculty/assignments/{assignmentId}
     */
    @PatchMapping("/assignments/{assignmentId}")
    @Transactional
    public ResponseEntity<?> updateAssignment(
            @PathVariable String assignmentId,
            @RequestBody Map<String, Object> payload) {

        Integer semesterId = payload.get("semesterId") != null ? Integer.parseInt(payload.get("semesterId").toString()) : null;
        String academicYearId = (String) payload.getOrDefault("academicYearId", "2024-25-even");

        Optional<FacultyCourseAssignment> assignmentOpt = semesterId != null
                ? assignmentRepository.findByIdAndSemesterIdAndAcademicYearId(assignmentId, semesterId, academicYearId)
                : assignmentRepository.findById(assignmentId);

        if (assignmentOpt.isEmpty() || !"ACTIVE".equals(assignmentOpt.get().getStatus())) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Faculty assignment was not found in the selected semester."));
        }

        FacultyCourseAssignment assignment = assignmentOpt.get();

        if (payload.containsKey("weeklyTeachingCredits") && payload.get("weeklyTeachingCredits") != null) {
            assignment.setWeeklyTeachingCredits(Integer.parseInt(payload.get("weeklyTeachingCredits").toString()));
        }
        if (payload.containsKey("assignedRole") && payload.get("assignedRole") != null) {
            assignment.setAssignedRole(payload.get("assignedRole").toString().toUpperCase());
        }
        if (payload.containsKey("status") && payload.get("status") != null) {
            assignment.setStatus(payload.get("status").toString().toUpperCase());
        }
        if (payload.containsKey("facultyId") && payload.get("facultyId") != null) {
            FacultyMember newFaculty = facultyMemberRepository.findById(payload.get("facultyId").toString()).orElse(null);
            if (newFaculty != null) assignment.setFaculty(newFaculty);
        }

        FacultyCourseAssignment updated = assignmentRepository.save(assignment);

        auditService.log("FACULTY_ASSIGNMENT_UPDATED", "FacultyCourseAssignment", null,
                String.format("Updated assignment %s in Semester %d", assignmentId, assignment.getSemesterId()));

        return ResponseEntity.ok(Map.of("success", true, "message", "Assignment updated successfully.", "data", updated));
    }

    /**
     * DELETE /api/admin/faculty/assignments/{assignmentId}
     */
    @DeleteMapping("/assignments/{assignmentId}")
    @Transactional
    public ResponseEntity<?> removeAssignment(
            @PathVariable String assignmentId,
            @RequestParam(value = "semesterId", required = false) Integer semesterId,
            @RequestParam(value = "academicYearId", defaultValue = "2024-25-even") String academicYearId) {

        Optional<FacultyCourseAssignment> assignmentOpt = semesterId != null
                ? assignmentRepository.findByIdAndSemesterIdAndAcademicYearId(assignmentId, semesterId, academicYearId)
                : assignmentRepository.findById(assignmentId);

        if (assignmentOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Faculty assignment was not found in the selected semester."));
        }

        FacultyCourseAssignment assignment = assignmentOpt.get();
        assignment.setStatus("REMOVED");
        assignmentRepository.save(assignment);

        auditService.log("FACULTY_ASSIGNMENT_REMOVED", "FacultyCourseAssignment", null,
                String.format("Removed course assignment %s for faculty %s from Semester %d",
                        assignment.getCourseCode(), assignment.getFaculty().getFullName(), assignment.getSemesterId()));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Faculty assignment removed from Semester " + assignment.getSemesterId()
        ));
    }

    /**
     * POST /api/admin/faculty/import/preview
     */
    @PostMapping(value = "/import/preview", consumes = "multipart/form-data")
    public ResponseEntity<?> previewImport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("semesterId") Integer semesterId,
            @RequestParam(value = "academicYearId", defaultValue = "2024-25-even") String academicYearId) {

        if (semesterId == null || semesterId < 1 || semesterId > 6) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "A valid semester between 1 and 6 is required."));
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Please select a CSV, XLS, or XLSX document."));
        }

        try {
            List<Map<String, String>> rawRows = parseFile(file);
            if (rawRows.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "The document is empty."));
            }

            Set<String> headers = rawRows.get(0).keySet();
            String facIdHeader = matchHeader(headers, "Faculty ID", "Faculty Code", "FAC ID", "FacultyId", "FacultyCode");
            String facNameHeader = matchHeader(headers, "Faculty Name", "Name", "Instructor", "FullName");
            String courseCodeHeader = matchHeader(headers, "Course Code", "Subject Code", "Code", "Course");
            String creditsHeader = matchHeader(headers, "Weekly Teaching Credits", "Teaching Credits", "Credits", "Hours");
            String roleHeader = matchHeader(headers, "Assignment Role", "Role", "Designation Role");
            String deptHeader = matchHeader(headers, "Department", "Dept");
            String emailHeader = matchHeader(headers, "Email", "Email Address");

            if (facIdHeader == null || courseCodeHeader == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Missing required columns: Faculty ID/Code and Course Code are mandatory."
                ));
            }

            // Get valid courses for this semester from database
            List<Subject> semesterSubjects = subjectRepository.findBySemesterIdAndAcademicYearId(semesterId, academicYearId);
            Set<String> validCourseCodes = semesterSubjects.stream()
                    .map(s -> s.getCode().trim().toUpperCase())
                    .collect(Collectors.toSet());

            List<Map<String, Object>> previewRows = new ArrayList<>();
            List<Map<String, Object>> validRowsForImport = new ArrayList<>();
            Set<String> seenPairs = new HashSet<>();

            int totalRows = 0;
            int readyCount = 0;
            int warningCount = 0;
            int errorCount = 0;
            int newCount = 0;
            int updateCount = 0;

            for (int i = 0; i < rawRows.size(); i++) {
                totalRows++;
                Map<String, String> row = rawRows.get(i);
                String rawFacCode = row.get(facIdHeader);
                String rawFacName = facNameHeader != null ? row.get(facNameHeader) : "Faculty " + rawFacCode;
                String rawCourseCode = row.get(courseCodeHeader);
                String rawCredits = creditsHeader != null ? row.get(creditsHeader) : "4";
                String rawRole = roleHeader != null ? row.get(roleHeader) : "PRIMARY";
                String rawDept = deptHeader != null ? row.get(deptHeader) : "BCA";
                String rawEmail = emailHeader != null ? row.get(emailHeader) : null;

                List<String> errors = new ArrayList<>();
                List<String> warnings = new ArrayList<>();

                if (rawFacCode == null || rawFacCode.isBlank()) errors.add("Faculty ID is required.");
                if (rawCourseCode == null || rawCourseCode.isBlank()) errors.add("Course Code is required.");

                String upperFacCode = rawFacCode != null ? rawFacCode.trim().toUpperCase() : "";
                String upperCourseCode = rawCourseCode != null ? rawCourseCode.trim().toUpperCase() : "";
                String pairKey = upperFacCode + "::" + upperCourseCode;

                if (!upperCourseCode.isEmpty() && !validCourseCodes.isEmpty() && !validCourseCodes.contains(upperCourseCode)) {
                    errors.add("Course " + upperCourseCode + " does not belong to Semester " + semesterId + ".");
                }

                if (!upperFacCode.isEmpty() && !upperCourseCode.isEmpty()) {
                    if (seenPairs.contains(pairKey)) {
                        errors.add("Duplicate assignment for " + upperFacCode + " & " + upperCourseCode + " in uploaded file.");
                    } else {
                        seenPairs.add(pairKey);
                    }

                    // Check if already assigned in database
                    boolean exists = assignmentRepository.existsByFacultyIdAndCourseIdAndSemesterIdAndAcademicYearIdAndStatus(
                            upperFacCode, upperCourseCode, semesterId, academicYearId, "ACTIVE");
                    if (exists) {
                        warnings.add("Allocation already exists in Semester " + semesterId + ". Will update teaching credits.");
                        updateCount++;
                    } else {
                        newCount++;
                    }
                }

                int parsedCredits = 4;
                try {
                    if (rawCredits != null && !rawCredits.isBlank()) parsedCredits = Integer.parseInt(rawCredits.trim());
                } catch (Exception e) {
                    warnings.add("Invalid credits \"" + rawCredits + "\", defaulted to 4.");
                }

                Map<String, Object> previewRow = new LinkedHashMap<>();
                previewRow.put("rowIndex", i + 1);
                previewRow.put("facultyCode", upperFacCode);
                previewRow.put("facultyName", rawFacName != null ? rawFacName.trim() : "Unknown");
                previewRow.put("courseCode", upperCourseCode);
                previewRow.put("weeklyTeachingCredits", parsedCredits);
                previewRow.put("assignedRole", rawRole != null ? rawRole.trim().toUpperCase() : "PRIMARY");
                previewRow.put("department", rawDept != null ? rawDept.trim() : "BCA");
                previewRow.put("email", rawEmail != null ? rawEmail.trim() : "");

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

            String uploadId = "FAC-UP-" + UUID.randomUUID().toString();
            importCache.put(uploadId, validRowsForImport);
            fileNameCache.put(uploadId, file.getOriginalFilename());

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
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to parse document: " + e.getMessage()));
        }
    }

    /**
     * POST /api/admin/faculty/import/confirm
     */
    @PostMapping("/import/confirm")
    @Transactional
    public ResponseEntity<?> confirmImport(@RequestBody Map<String, Object> payload) {
        String uploadId = (String) payload.get("uploadId");
        Integer semesterId = (Integer) payload.get("semesterId");
        String academicYearId = (String) payload.getOrDefault("academicYearId", "2024-25-even");
        String mode = (String) payload.getOrDefault("mode", "merge");

        if (semesterId == null || semesterId < 1 || semesterId > 6) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "A valid semester between 1 and 6 is required."));
        }

        if (uploadId == null || !importCache.containsKey(uploadId)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid or expired import session."));
        }

        List<Map<String, Object>> validRows = importCache.remove(uploadId);
        String originalFileName = fileNameCache.remove(uploadId);

        if (validRows == null || validRows.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No valid allocations to import."));
        }

        if ("replace-semester".equalsIgnoreCase(mode)) {
            assignmentRepository.deleteBySemesterIdAndAcademicYearId(semesterId, academicYearId);
        }

        int importedCount = 0;
        for (Map<String, Object> r : validRows) {
            String facCode = (String) r.get("facultyCode");
            String facName = (String) r.get("facultyName");
            String courseCode = (String) r.get("courseCode");
            Integer credits = (Integer) r.get("weeklyTeachingCredits");
            String role = (String) r.get("assignedRole");
            String dept = (String) r.get("department");
            String email = (String) r.get("email");

            // Upsert faculty profile
            FacultyMember faculty = facultyMemberRepository.findByFacultyCode(facCode).orElseGet(() -> {
                FacultyMember fm = new FacultyMember();
                fm.setId("FAC-" + UUID.randomUUID().toString());
                fm.setFacultyCode(facCode);
                fm.setFullName(facName != null ? facName : "Faculty " + facCode);
                fm.setDepartment(dept != null ? dept : "BCA");
                fm.setEmail(email);
                fm.setEmploymentStatus("ACTIVE");
                return facultyMemberRepository.save(fm);
            });

            Optional<FacultyCourseAssignment> existing = assignmentRepository.findByFacultyIdAndCourseIdAndSemesterIdAndAcademicYearId(
                    faculty.getId(), courseCode, semesterId, academicYearId);

            if ("add-only".equalsIgnoreCase(mode) && existing.isPresent() && "ACTIVE".equals(existing.get().getStatus())) {
                continue;
            }

            FacultyCourseAssignment assignment;
            if (existing.isPresent()) {
                assignment = existing.get();
                assignment.setWeeklyTeachingCredits(credits != null ? credits : 4);
                assignment.setAssignedRole(role != null ? role : "PRIMARY");
                assignment.setStatus("ACTIVE");
            } else {
                assignment = new FacultyCourseAssignment();
                assignment.setId("ASG-" + UUID.randomUUID().toString());
                assignment.setFaculty(faculty);
                assignment.setCourseId(courseCode);
                assignment.setCourseCode(courseCode);
                assignment.setSemesterId(semesterId);
                assignment.setAcademicYearId(academicYearId);
                assignment.setWeeklyTeachingCredits(credits != null ? credits : 4);
                assignment.setAssignedRole(role != null ? role : "PRIMARY");
                assignment.setStatus("ACTIVE");
            }

            assignmentRepository.save(assignment);
            importedCount++;
        }

        auditService.log("FACULTY_ASSIGNMENT_DOCUMENT_IMPORTED", "FacultyCourseAssignment", null,
                String.format("Imported %d course allocations into Semester %d (%s) from file %s (mode: %s)",
                        importedCount, semesterId, academicYearId, originalFileName, mode));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Successfully imported " + importedCount + " faculty course assignments into Semester " + semesterId + "."
        ));
    }

    /**
     * GET /api/admin/faculty/template?semesterId=6
     */
    @GetMapping({"/template", "/import-template"})
    public ResponseEntity<String> getTemplate(@RequestParam(value = "semesterId", required = false) Integer semesterId) {
        int sem = semesterId != null ? semesterId : 6;
        String csv = "Faculty ID,Faculty Name,Course Code,Weekly Teaching Credits,Assignment Role,Department,Email\n"
                + "FAC01,Dr. A. Sharma,BCA601,4,PRIMARY,BCA,sharma@example.com\n"
                + "FAC02,Prof. Sneha Rao,BCA602,4,PRIMARY,BCA,sneha@example.com\n"
                + "FAC03,Prof. Rajesh Nair,BCA605P,2,LAB_INCHARGE,BCA,rajesh@example.com\n";

        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=semester_" + sem + "_faculty_allocations_template.csv")
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
