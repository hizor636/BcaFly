package com.bcafly.admin;

import com.bcafly.academics.Subject;
import com.bcafly.academics.SubjectRepository;
import com.bcafly.academics.UploadedDocument;
import com.bcafly.academics.UploadedDocumentRepository;
import com.bcafly.academics.FacultyAssignment;
import com.bcafly.academics.FacultyAssignmentRepository;
import com.bcafly.common.AuditService;
import org.apache.poi.ss.usermodel.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCourseController {

    private final SubjectRepository subjectRepository;
    private final FacultyAssignmentRepository facultyAssignmentRepository;
    private final UploadedDocumentRepository uploadedDocumentRepository;
    private final AuditService auditService;

    // In-memory cache for storing preview records before import confirmation
    private final Map<String, List<Subject>> importCache = new ConcurrentHashMap<>();
    private final Map<String, String> fileNameCache = new ConcurrentHashMap<>();

    public AdminCourseController(SubjectRepository subjectRepository,
                                 FacultyAssignmentRepository facultyAssignmentRepository,
                                 UploadedDocumentRepository uploadedDocumentRepository,
                                 AuditService auditService) {
        this.subjectRepository = subjectRepository;
        this.facultyAssignmentRepository = facultyAssignmentRepository;
        this.uploadedDocumentRepository = uploadedDocumentRepository;
        this.auditService = auditService;
    }

    @GetMapping("/courses")
    public ResponseEntity<?> listCourses(
            @RequestParam(value = "semesterId", required = false) Integer semesterId,
            @RequestParam(value = "academicYearId", required = false) String academicYearId) {

        List<Subject> courses;
        if (semesterId != null && academicYearId != null) {
            courses = subjectRepository.findBySemesterNumberAndAcademicYearIdAndIsActiveTrue(semesterId, academicYearId);
        } else if (semesterId != null) {
            courses = subjectRepository.findBySemesterNumberAndIsActiveTrue(semesterId);
        } else {
            courses = subjectRepository.findByIsActiveTrue();
        }
        return ResponseEntity.ok(Map.of("success", true, "data", courses, "count", courses.size()));
    }

    @PostMapping("/courses")
    public ResponseEntity<?> createCourse(@RequestBody Subject course) {
        if (course.getSemesterNumber() == null || course.getSemesterNumber() < 1 || course.getSemesterNumber() > 6) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "A valid semester between 1 and 6 is required."));
        }
        Subject saved = subjectRepository.save(course);
        auditService.log("COURSE_CREATED", "Subject", saved.getId(),
                "Created course " + saved.getCode() + " (" + saved.getTitle() + ") for semester " + saved.getSemesterNumber());
        return ResponseEntity.ok(Map.of("success", true, "data", saved));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody Subject courseUpdates) {
        return subjectRepository.findById(id).map(subject -> {
            if (courseUpdates.getTitle() != null) subject.setTitle(courseUpdates.getTitle());
            if (courseUpdates.getCredits() != null) subject.setCredits(courseUpdates.getCredits());
            if (courseUpdates.getCourseType() != null) subject.setCourseType(courseUpdates.getCourseType());
            if (courseUpdates.getClassroomOrSlot() != null) subject.setClassroomOrSlot(courseUpdates.getClassroomOrSlot());
            if (courseUpdates.getAssignedFacultyId() != null) subject.setAssignedFacultyId(courseUpdates.getAssignedFacultyId());
            if (courseUpdates.getAcademicYearId() != null) subject.setAcademicYearId(courseUpdates.getAcademicYearId());
            if (courseUpdates.getSemesterNumber() != null) {
                if (courseUpdates.getSemesterNumber() < 1 || courseUpdates.getSemesterNumber() > 6) {
                    throw new IllegalArgumentException("Semester number must be between 1 and 6");
                }
                subject.setSemesterNumber(courseUpdates.getSemesterNumber());
            }

            Subject updated = subjectRepository.save(subject);
            auditService.log("COURSE_UPDATED", "Subject", updated.getId(),
                    "Updated course " + updated.getCode() + " in semester " + updated.getSemesterNumber());
            return ResponseEntity.ok(Map.of("success", true, "data", updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        return subjectRepository.findById(id).map(subject -> {
            subject.setIsActive(false);
            subjectRepository.save(subject);
            auditService.log("COURSE_DELETED", "Subject", id,
                    "Deactivated course " + subject.getCode() + " from semester " + subject.getSemesterNumber());
            return ResponseEntity.ok(Map.of("success", true, "message", "Course deleted successfully", "id", id));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/courses/bulk-delete")
    public ResponseEntity<?> bulkDeleteCourses(@RequestBody Map<String, List<Long>> request) {
        List<Long> courseIds = request.getOrDefault("courseIds", Collections.emptyList());
        int count = 0;
        for (Long id : courseIds) {
            Optional<Subject> subj = subjectRepository.findById(id);
            if (subj.isPresent()) {
                Subject s = subj.get();
                s.setIsActive(false);
                subjectRepository.save(s);
                count++;
            }
        }
        auditService.log("COURSES_BULK_DELETED", "Subject", null,
                "Bulk deleted " + count + " courses");
        return ResponseEntity.ok(Map.of("success", true, "deletedCount", count));
    }

    @PostMapping(value = "/courses/import/preview", consumes = "multipart/form-data")
    public ResponseEntity<?> importPreview(
            @RequestParam("file") MultipartFile file,
            @RequestParam("semesterId") Integer semesterId,
            @RequestParam("academicYearId") String academicYearId) {

        if (semesterId == null || semesterId < 1 || semesterId > 6) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "A valid semester between 1 and 6 is required."
            ));
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Please select a CSV, XLS, or XLSX document."
            ));
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || (!originalName.endsWith(".csv") && !originalName.endsWith(".xlsx") && !originalName.endsWith(".xls"))) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Please select a CSV, XLS, or XLSX document."
            ));
        }

        try {
            List<Map<String, String>> rawRows = parseFile(file);
            if (rawRows.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "The document must not be empty."
                ));
            }

            // Normalizing column headers
            Set<String> headers = rawRows.get(0).keySet();
            String codeHeader = matchHeader(headers, "Course Code", "Subject Code", "Code");
            String titleHeader = matchHeader(headers, "Course Title", "Subject Name", "Title", "Course Name");
            String typeHeader = matchHeader(headers, "Course Type", "Type", "Subject Type");
            String creditsHeader = matchHeader(headers, "Credits", "Credit", "Total Credits");
            String facultyHeader = matchHeader(headers, "Faculty", "Assigned Faculty", "Instructor");
            String slotHeader = matchHeader(headers, "Classroom Slot", "Room", "Slot", "Class Room");

            List<String> missingHeaders = new ArrayList<>();
            if (codeHeader == null) missingHeaders.add("Course Code");
            if (titleHeader == null) missingHeaders.add("Course Title");
            if (typeHeader == null) missingHeaders.add("Course Type");
            if (creditsHeader == null) missingHeaders.add("Credits");

            if (!missingHeaders.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Missing required columns: " + String.join(", ", missingHeaders)
                ));
            }

            List<Map<String, Object>> previewRows = new ArrayList<>();
            List<Subject> validCourses = new ArrayList<>();
            Set<String> seenCodesInFile = new HashSet<>();

            int totalRows = 0;
            int readyCount = 0;
            int warningCount = 0;
            int errorCount = 0;

            for (int i = 0; i < rawRows.size(); i++) {
                totalRows++;
                Map<String, String> row = rawRows[i];
                String rawCode = row.get(codeHeader);
                String rawTitle = row.get(titleHeader);
                String rawType = row.get(typeHeader);
                String rawCredits = row.get(creditsHeader);
                String rawFaculty = facultyHeader != null ? row.get(facultyHeader) : null;
                String rawSlot = slotHeader != null ? row.get(slotHeader) : null;

                List<String> errors = new ArrayList<>();
                List<String> warnings = new ArrayList<>();
                String status = "ready";

                if (rawCode == null || rawCode.isBlank()) {
                    errors.add("Course Code is required.");
                }
                if (rawTitle == null || rawTitle.isBlank()) {
                    errors.add("Course Title is required.");
                }

                Integer parsedCredits = null;
                if (rawCredits == null || rawCredits.isBlank()) {
                    errors.add("Credits column cannot be empty.");
                } else {
                    try {
                        parsedCredits = Integer.parseInt(rawCredits);
                    } catch (NumberFormatException e) {
                        errors.add("Credits must be a valid numeric value.");
                    }
                }

                String normalizedType = "Core Theory";
                if (rawType != null && !rawType.isBlank()) {
                    String norm = rawType.trim().toLowerCase();
                    if (norm.contains("lab") || norm.contains("practical")) {
                        normalizedType = "Lab / Practical";
                    } else if (norm.contains("elective")) {
                        normalizedType = "Elective";
                    } else if (norm.contains("theory") || norm.contains("core")) {
                        normalizedType = "Core Theory";
                    } else {
                        warnings.add("Unknown course type: \"" + rawType + "\". Defaulted to \"Core Theory\".");
                    }
                }

                // Check duplicate in file
                if (rawCode != null && !rawCode.isBlank()) {
                    String upperCode = rawCode.trim().toUpperCase();
                    if (seenCodesInFile.contains(upperCode)) {
                        errors.add("Duplicate course code in uploaded file: " + upperCode);
                    } else {
                        seenCodesInFile.add(upperCode);
                    }

                    // Check duplicate in database
                    Optional<Subject> dbSubject = subjectRepository.findBySemesterNumberAndAcademicYearIdAndCode(semesterId, academicYearId, upperCode);
                    if (dbSubject.isPresent()) {
                        warnings.add("Course Code already exists in Semester (" + upperCode + "). Existing records will be merged/overwritten.");
                    }
                }

                Map<String, Object> previewRow = new LinkedHashMap<>();
                previewRow.put("rowIndex", i + 1);
                previewRow.put("courseCode", rawCode != null ? rawCode.trim().toUpperCase() : "");
                previewRow.put("courseTitle", rawTitle != null ? rawTitle.trim() : "");
                previewRow.put("courseType", normalizedType);
                previewRow.put("credits", parsedCredits != null ? parsedCredits : 4);
                previewRow.put("assignedFacultyId", rawFaculty != null ? rawFaculty.trim() : "FAC01");
                previewRow.put("classroomOrSlot", rawSlot != null ? rawSlot.trim() : "Room 301");

                if (!errors.isEmpty()) {
                    previewRow.put("errors", errors);
                    previewRow.put("status", "error");
                    errorCount++;
                } else if (!warnings.isEmpty()) {
                    previewRow.put("warnings", warnings);
                    previewRow.put("status", "warning");
                    warningCount++;
                    readyCount++; // warnings are valid to import
                } else {
                    previewRow.put("status", "ready");
                    readyCount++;
                }
                previewRows.add(previewRow);

                // Add to list of valid courses for this import preview session
                if (errors.isEmpty()) {
                    Subject subject = new Subject();
                    subject.setCode(rawCode.trim().toUpperCase());
                    subject.setTitle(rawTitle.trim());
                    subject.setCredits(parsedCredits);
                    subject.setSemesterNumber(semesterId);
                    subject.setAcademicYearId(academicYearId);
                    subject.setCourseType(normalizedType);
                    subject.setAssignedFacultyId(rawFaculty != null ? rawFaculty.trim() : "FAC01");
                    subject.setClassroomOrSlot(rawSlot != null ? rawSlot.trim() : "Room 301");
                    subject.setIsActive(true);
                    validCourses.add(subject);
                }
            }

            String uploadId = "UP-" + UUID.randomUUID().toString();
            importCache.put(uploadId, validCourses);
            fileNameCache.put(uploadId, originalName);

            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("totalRows", totalRows);
            stats.put("readyCount", readyCount);
            stats.put("warningCount", warningCount);
            stats.put("errorCount", errorCount);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "uploadId", uploadId,
                    "semesterId", semesterId,
                    "academicYearId", academicYearId,
                    "stats", stats,
                    "rows", previewRows
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to parse document: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/courses/import/confirm")
    public ResponseEntity<?> importConfirm(@RequestBody Map<String, Object> payload) {
        String uploadId = (String) payload.get("uploadId");
        Integer semesterId = (Integer) payload.get("semesterId");
        String academicYearId = (String) payload.get("academicYearId");
        String mode = (String) payload.get("mode"); // "merge" or "replace"

        if (semesterId == null || semesterId < 1 || semesterId > 6) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "A valid semester between 1 and 6 is required."));
        }

        if (uploadId == null || !importCache.containsKey(uploadId)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid or expired import session."));
        }

        List<Subject> validCourses = importCache.remove(uploadId);
        String originalFileName = fileNameCache.remove(uploadId);

        if (validCourses == null || validCourses.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No valid records to import."));
        }

        // Apply replace mode safely only to the active semester + academic year
        if ("replace".equalsIgnoreCase(mode)) {
            subjectRepository.deleteBySemesterNumberAndAcademicYearId(semesterId, academicYearId);
        }

        for (Subject course : validCourses) {
            Optional<Subject> existing = subjectRepository.findBySemesterNumberAndAcademicYearIdAndCode(
                    semesterId, academicYearId, course.getCode());
            if (existing.isPresent()) {
                Subject target = existing.get();
                target.setTitle(course.getTitle());
                target.setCredits(course.getCredits());
                target.setCourseType(course.getCourseType());
                target.setAssignedFacultyId(course.getAssignedFacultyId());
                target.setClassroomOrSlot(course.getClassroomOrSlot());
                target.setIsActive(true);
                subjectRepository.save(target);
            } else {
                subjectRepository.save(course);
            }
        }

        // Create UploadedDocument entity log
        UploadedDocument doc = new UploadedDocument();
        doc.setId(uploadId);
        doc.setSemesterId(semesterId);
        doc.setAcademicYearId(academicYearId);
        doc.setOriginalFileName(originalFileName != null ? originalFileName : "imported_file.xlsx");
        doc.setFileType(getFileExtension(doc.getOriginalFileName()));
        doc.setStorageUrl("../storage/uploads/" + uploadId);
        doc.setUploadedBy("ADMIN");
        doc.setImportStatus("imported");
        uploadedDocumentRepository.save(doc);

        auditService.log("COURSE_DOCUMENT_IMPORTED", "UploadedDocument", null,
                String.format("Imported %d courses into Semester %d for academic year %s from %s",
                        validCourses.size(), semesterId, academicYearId, doc.getOriginalFileName()));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Successfully imported " + validCourses.size() + " courses into Semester " + semesterId + "."
        ));
    }

    private List<Map<String, String>> parseFile(MultipartFile file) throws Exception {
        List<Map<String, String>> rows = new ArrayList<>();
        String originalName = file.getOriginalFilename();

        if (originalName != null && (originalName.endsWith(".xlsx") || originalName.endsWith(".xls"))) {
            // Excel parsing using Apache POI
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

                if (headerRow == null) {
                    throw new IllegalArgumentException("No valid header row found in the document.");
                }

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
                        String header = headers.get(c);
                        if (header.isEmpty()) continue;
                        rowMap.put(header, getCellValueAsString(row.getCell(c)).trim());
                    }
                    rows.add(rowMap);
                }
            }
        } else {
            // CSV parsing
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
                String headerLine = reader.readLine();
                if (headerLine == null || headerLine.isBlank()) {
                    throw new IllegalArgumentException("CSV file is empty or missing header row.");
                }

                String[] headers = headerLine.split(",");
                for (int i = 0; i < headers.length; i++) {
                    headers[i] = headers[i].trim();
                }

                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.isBlank()) continue;
                    String[] cols = line.split(",", -1);
                    Map<String, String> rowMap = new LinkedHashMap<>();
                    for (int c = 0; c < headers.length; c++) {
                        if (headers[c].isEmpty()) continue;
                        String val = c < cols.length ? cols[c].trim() : "";
                        rowMap.put(headers[c], val);
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
            if (!getCellValueAsString(row.getCell(c)).trim().isEmpty()) {
                count++;
            }
        }
        return count;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                double val = cell.getNumericCellValue();
                if (val == (long) val) {
                    return String.format("%d", (long) val);
                } else {
                    return String.format("%s", val);
                }
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            case BLANK: return "";
            default: return "";
        }
    }

    private String matchHeader(Set<String> headers, String... possibleHeaders) {
        for (String possible : possibleHeaders) {
            for (String h : headers) {
                if (h.equalsIgnoreCase(possible) ||
                    h.toLowerCase().replace(" ", "").replace("_", "").equals(
                    possible.toLowerCase().replace(" ", "").replace("_", ""))) {
                    return h;
                }
            }
        }
        return null;
    }

    private String getFileExtension(String fileName) {
        int dotIdx = fileName.lastIndexOf('.');
        if (dotIdx == -1 || dotIdx == fileName.length() - 1) return "csv";
        return fileName.substring(dotIdx + 1).toLowerCase();
    }
}
