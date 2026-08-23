package com.bcafly.common;

import com.bcafly.users.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Append-only audit logging service.
 *
 * All sensitive operations across the platform must call this service
 * to create immutable audit entries. Audit logs cannot be edited or
 * deleted through normal application flows.
 *
 * Every log captures: actor, role, action, entity context, old/new values,
 * timestamp, and IP address.
 */
@Service
public class AuditService {

    private final JdbcTemplate jdbcTemplate;
    private final ScopeValidator scopeValidator;

    public AuditService(JdbcTemplate jdbcTemplate, ScopeValidator scopeValidator) {
        this.jdbcTemplate = jdbcTemplate;
        this.scopeValidator = scopeValidator;
    }

    /**
     * Log an audit event for the currently authenticated user.
     *
     * @param action      The action performed (e.g., "STUDENT_IMPORT_COMPLETED")
     * @param entityType  The entity type affected (e.g., "StudentProfile")
     * @param entityId    The primary key of the affected entity
     * @param details     Human-readable description of the action
     */
    public void log(String action, String entityType, Long entityId, String details) {
        User user = scopeValidator.getAuthenticatedUser();
        Long userId = user != null ? user.getId() : null;

        jdbcTemplate.update(
            "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            userId, action, entityType, entityId, details, LocalDateTime.now()
        );
    }

    /**
     * Log an audit event with explicit actor (for system-initiated actions).
     */
    public void log(Long actorUserId, String action, String entityType, Long entityId, String details) {
        jdbcTemplate.update(
            "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            actorUserId, action, entityType, entityId, details, LocalDateTime.now()
        );
    }

    /**
     * Log a change event with old and new values for data-change tracking.
     */
    public void logChange(String action, String entityType, Long entityId, String oldValue, String newValue) {
        User user = scopeValidator.getAuthenticatedUser();
        Long userId = user != null ? user.getId() : null;
        String details = "Old: " + (oldValue != null ? oldValue : "null") + " → New: " + (newValue != null ? newValue : "null");

        jdbcTemplate.update(
            "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            userId, action, entityType, entityId, details, LocalDateTime.now()
        );
    }

    /**
     * Log a student import event with row counts.
     */
    public void logImport(String importType, Long importJobId, int totalRows, int successRows, int errorRows) {
        log("IMPORT_" + importType.toUpperCase(),
            "ImportJob",
            importJobId,
            String.format("Import completed: %d total, %d success, %d errors", totalRows, successRows, errorRows)
        );
    }

    /**
     * Log an approval decision.
     */
    public void logApproval(String requestType, Long requestId, String decision, String remarks) {
        log("APPROVAL_" + decision.toUpperCase(),
            "ApprovalRequest",
            requestId,
            String.format("Type: %s, Decision: %s, Remarks: %s", requestType, decision, remarks)
        );
    }

    /**
     * Log a workspace lifecycle transition.
     */
    public void logWorkspaceTransition(Long workspaceId, String fromStatus, String toStatus) {
        logChange("WORKSPACE_STATUS_CHANGE", "SemesterWorkspace", workspaceId, fromStatus, toStatus);
    }

    /**
     * Log an academic record lock event.
     */
    public void logRecordLock(Long workspaceId, String lockType) {
        log("ACADEMIC_RECORD_LOCKED",
            "SemesterWorkspace",
            workspaceId,
            String.format("Semester records locked. Type: %s", lockType)
        );
    }

    /**
     * Log marks publication.
     */
    public void logMarksPublication(Long subjectId, String courseCode, int studentCount) {
        log("MARKS_PUBLISHED",
            "InternalMark",
            subjectId,
            String.format("Published marks for %s (%d students)", courseCode, studentCount)
        );
    }

    /**
     * Log attendance submission.
     */
    public void logAttendanceSubmission(Long sessionId, String courseCode, int presentCount, int absentCount) {
        log("ATTENDANCE_SUBMITTED",
            "AttendanceSession",
            sessionId,
            String.format("Attendance for %s: %d present, %d absent", courseCode, presentCount, absentCount)
        );
    }
}
