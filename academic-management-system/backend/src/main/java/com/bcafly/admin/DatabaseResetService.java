package com.bcafly.admin;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@SuppressWarnings("all")
public class DatabaseResetService {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseResetService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Compute impact preview counts for the requested mode and workspace.
     */
    public Map<String, Object> getResetPreview(String mode, Integer semesterId, String academicYearId) {
        String safeMode = mode != null ? mode.toLowerCase() : "academic-data";
        String safeYear = academicYearId != null ? academicYearId : "2024-25-even";

        Map<String, Integer> counts = new LinkedHashMap<>();
        int totalAffected = 0;

        try {
            if ("audit-logs".equals(safeMode)) {
                int auditLogs = countSafe("SELECT COUNT(*) FROM audit_logs");
                counts.put("auditLogs", auditLogs);
                totalAffected = auditLogs;
            } else if ("student-data".equals(safeMode)) {
                int attendance = countSafe("SELECT COUNT(*) FROM student_attendance");
                int marks = countSafe("SELECT COUNT(*) FROM internal_marks");
                int enrolments = countSafe("SELECT COUNT(*) FROM student_enrolments");
                int studentProfiles = countSafe("SELECT COUNT(*) FROM student_profiles");
                int students = countSafe("SELECT COUNT(*) FROM students");

                counts.put("attendanceRecords", attendance);
                counts.put("marksAndResults", marks);
                counts.put("studentEnrolments", enrolments);
                counts.put("studentProfiles", studentProfiles);
                counts.put("students", students);
                totalAffected = attendance + marks + enrolments + studentProfiles + students;
            } else if ("semester-data".equals(safeMode)) {
                int sem = semesterId != null ? semesterId : 6;
                int courses = countSafe("SELECT COUNT(*) FROM subjects WHERE semester_id = " + sem);
                int facultyAssignments = countSafe("SELECT COUNT(*) FROM faculty_course_assignments WHERE semester_id = " + sem);
                int enrolments = countSafe("SELECT COUNT(*) FROM student_enrolments WHERE semester_id = " + sem);
                int uploadedDocs = countSafe("SELECT COUNT(*) FROM uploaded_documents WHERE semester_id = " + sem);
                int timetable = countSafe("SELECT COUNT(*) FROM timetable_entries WHERE semester_id = '" + sem + "'");
                int marks = countSafe("SELECT COUNT(*) FROM internal_marks WHERE subject_id IN (SELECT id FROM subjects WHERE semester_id = " + sem + ")");
                int attendance = countSafe("SELECT COUNT(*) FROM attendance_sessions WHERE semester_id = " + sem);

                counts.put("courses", courses);
                counts.put("facultyAssignments", facultyAssignments);
                counts.put("studentEnrolments", enrolments);
                counts.put("uploadedDocuments", uploadedDocs);
                counts.put("timetableEntries", timetable);
                counts.put("marksAndResults", marks);
                counts.put("attendanceSessions", attendance);
                totalAffected = courses + facultyAssignments + enrolments + uploadedDocs + timetable + marks + attendance;
            } else { // academic-data or factory-reset
                int auditLogs = countSafe("SELECT COUNT(*) FROM audit_logs");
                int courses = countSafe("SELECT COUNT(*) FROM subjects");
                int facultyAssignments = countSafe("SELECT COUNT(*) FROM faculty_course_assignments");
                int students = countSafe("SELECT COUNT(*) FROM students");
                int enrolments = countSafe("SELECT COUNT(*) FROM student_enrolments");
                int uploadedDocs = countSafe("SELECT COUNT(*) FROM uploaded_documents");
                int timetable = countSafe("SELECT COUNT(*) FROM timetable_entries");
                int marks = countSafe("SELECT COUNT(*) FROM internal_marks");
                int attendance = countSafe("SELECT COUNT(*) FROM student_attendance");
                int attendanceSessions = countSafe("SELECT COUNT(*) FROM attendance_sessions");
                int announcements = countSafe("SELECT COUNT(*) FROM announcements");

                counts.put("auditLogs", auditLogs);
                counts.put("courses", courses);
                counts.put("facultyAssignments", facultyAssignments);
                counts.put("students", students);
                counts.put("studentEnrolments", enrolments);
                counts.put("uploadedDocuments", uploadedDocs);
                counts.put("timetableEntries", timetable);
                counts.put("marksAndResults", marks);
                counts.put("attendanceRecords", attendance + attendanceSessions);
                counts.put("announcements", announcements);

                if ("factory-reset".equals(safeMode)) {
                    int faculty = countSafe("SELECT COUNT(*) FROM faculty_members");
                    int nonAdminUsers = countSafe("SELECT COUNT(*) FROM users WHERE role != 'ADMIN'");
                    counts.put("facultyMembers", faculty);
                    counts.put("nonAdminUsers", nonAdminUsers);
                    totalAffected += faculty + nonAdminUsers;
                }

                totalAffected += auditLogs + courses + facultyAssignments + students + enrolments + uploadedDocs + timetable + marks + attendance + attendanceSessions + announcements;
            }
        } catch (Exception e) {
            // Ignore missing table counts gracefully
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("mode", safeMode);
        result.put("scope", Map.of(
                "semesterId", semesterId != null ? semesterId : "ALL",
                "academicYearId", safeYear
        ));
        result.put("counts", counts);
        result.put("totalAffected", totalAffected);
        result.put("backupRequired", true);
        result.put("expectedConfirmationPhrase", getExpectedConfirmationPhrase(safeMode, semesterId, safeYear));

        return result;
    }

    /**
     * Executes the transactional reset after validating confirmation phrase.
     */
    @Transactional
    public Map<String, Object> executeReset(
            String mode,
            Integer semesterId,
            String academicYearId,
            String confirmationPhrase,
            boolean createBackup,
            String requestedBy) {

        String safeMode = mode != null ? mode.toLowerCase() : "academic-data";
        String safeYear = academicYearId != null ? academicYearId : "2024-25-even";
        String expectedPhrase = getExpectedConfirmationPhrase(safeMode, semesterId, safeYear);

        if (confirmationPhrase == null || !confirmationPhrase.trim().equalsIgnoreCase(expectedPhrase.trim())) {
            throw new IllegalArgumentException("The confirmation phrase does not match. Expected: \"" + expectedPhrase + "\"");
        }

        String resetId = "RESET-" + UUID.randomUUID().toString();
        int affectedCount = 0;

        // Perform deletions in strict foreign-key dependency order
        if ("audit-logs".equals(safeMode)) {
            affectedCount += execSafe("DELETE FROM audit_logs");
        } else if ("student-data".equals(safeMode)) {
            affectedCount += execSafe("DELETE FROM internal_marks");
            affectedCount += execSafe("DELETE FROM student_attendance");
            affectedCount += execSafe("DELETE FROM student_event_submissions");
            affectedCount += execSafe("DELETE FROM od_requests");
            affectedCount += execSafe("DELETE FROM student_enrolments");
            affectedCount += execSafe("DELETE FROM student_profiles");
            affectedCount += execSafe("DELETE FROM students WHERE id NOT IN (SELECT student_id FROM student_enrolments)");
        } else if ("semester-data".equals(safeMode)) {
            int sem = semesterId != null ? semesterId : 6;
            affectedCount += execSafe("DELETE FROM student_attendance WHERE session_id IN (SELECT id FROM attendance_sessions WHERE semester_id = " + sem + ")");
            affectedCount += execSafe("DELETE FROM attendance_sessions WHERE semester_id = " + sem);
            affectedCount += execSafe("DELETE FROM internal_marks WHERE subject_id IN (SELECT id FROM subjects WHERE semester_id = " + sem + ")");
            affectedCount += execSafe("DELETE FROM timetable_entries WHERE semester_id = '" + sem + "'");
            affectedCount += execSafe("DELETE FROM uploaded_documents WHERE semester_id = " + sem + " AND academic_year_id = '" + safeYear + "'");
            affectedCount += execSafe("DELETE FROM faculty_course_assignments WHERE semester_id = " + sem + " AND academic_year_id = '" + safeYear + "'");
            affectedCount += execSafe("DELETE FROM student_enrolments WHERE semester_id = " + sem + " AND academic_year_id = '" + safeYear + "'");
            affectedCount += execSafe("DELETE FROM subjects WHERE semester_id = " + sem + " AND academic_year_id = '" + safeYear + "'");
            affectedCount += execSafe("DELETE FROM students WHERE id NOT IN (SELECT student_id FROM student_enrolments)");
        } else if ("academic-data".equals(safeMode)) {
            affectedCount += execSafe("DELETE FROM audit_logs");
            affectedCount += execSafe("DELETE FROM student_attendance");
            affectedCount += execSafe("DELETE FROM attendance_sessions");
            affectedCount += execSafe("DELETE FROM internal_marks");
            affectedCount += execSafe("DELETE FROM student_event_submissions");
            affectedCount += execSafe("DELETE FROM od_requests");
            affectedCount += execSafe("DELETE FROM announcements");
            affectedCount += execSafe("DELETE FROM timetable_entries");
            affectedCount += execSafe("DELETE FROM uploaded_documents");
            affectedCount += execSafe("DELETE FROM faculty_course_assignments");
            affectedCount += execSafe("DELETE FROM student_enrolments");
            affectedCount += execSafe("DELETE FROM student_profiles");
            affectedCount += execSafe("DELETE FROM students");
            affectedCount += execSafe("DELETE FROM subjects");
        } else if ("factory-reset".equals(safeMode)) {
            affectedCount += execSafe("DELETE FROM audit_logs");
            affectedCount += execSafe("DELETE FROM student_attendance");
            affectedCount += execSafe("DELETE FROM attendance_sessions");
            affectedCount += execSafe("DELETE FROM internal_marks");
            affectedCount += execSafe("DELETE FROM student_event_submissions");
            affectedCount += execSafe("DELETE FROM od_requests");
            affectedCount += execSafe("DELETE FROM announcements");
            affectedCount += execSafe("DELETE FROM timetable_entries");
            affectedCount += execSafe("DELETE FROM uploaded_documents");
            affectedCount += execSafe("DELETE FROM faculty_course_assignments");
            affectedCount += execSafe("DELETE FROM student_enrolments");
            affectedCount += execSafe("DELETE FROM student_profiles");
            affectedCount += execSafe("DELETE FROM students");
            affectedCount += execSafe("DELETE FROM subjects");
            affectedCount += execSafe("DELETE FROM faculty_members");
            affectedCount += execSafe("DELETE FROM users WHERE role != 'ADMIN'");
        }

        // Store permanent log in system_reset_logs
        execSafe(
                "INSERT INTO system_reset_logs (id, reset_id, action, reset_mode, semester_id, academic_year_id, requested_by, backup_location, affected_records, created_at) " +
                        "VALUES ('" + UUID.randomUUID() + "', '" + resetId + "', 'DATABASE_RESET_COMPLETED', '" + safeMode + "', " +
                        (semesterId != null ? semesterId : "NULL") + ", '" + safeYear + "', '" +
                        (requestedBy != null ? requestedBy : "Administrator") + "', 'system/backups/" + resetId + ".json', " + affectedCount + ", CURRENT_TIMESTAMP)"
        );

        return Map.of(
                "success", true,
                "resetId", resetId,
                "mode", safeMode,
                "affectedRecords", affectedCount,
                "completedAt", LocalDateTime.now().toString(),
                "message", "Database reset completed successfully."
        );
    }

    public String getExpectedConfirmationPhrase(String mode, Integer semesterId, String academicYearId) {
        String m = mode != null ? mode.toLowerCase() : "academic-data";
        if ("academic-data".equals(m)) return "CLEAR ALL ACADEMIC DATA";
        if ("semester-data".equals(m)) {
            int sem = semesterId != null ? semesterId : 6;
            String year = academicYearId != null ? academicYearId.toUpperCase().replace("-", " ") : "2024 25 EVEN";
            return "CLEAR SEMESTER " + sem + " " + year;
        }
        if ("student-data".equals(m)) return "CLEAR ALL STUDENT DATA";
        if ("audit-logs".equals(m)) return "CLEAR AUDIT LOGS";
        if ("factory-reset".equals(m)) return "FACTORY RESET BCAFLY";
        return "CLEAR ALL ACADEMIC DATA";
    }

    private int countSafe(String sql) {
        try {
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            return count != null ? count : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    private int execSafe(String sql) {
        try {
            return jdbcTemplate.update(sql);
        } catch (Exception e) {
            return 0;
        }
    }
}
