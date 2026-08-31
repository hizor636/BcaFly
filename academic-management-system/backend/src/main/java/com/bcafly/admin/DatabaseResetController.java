package com.bcafly.admin;

import com.bcafly.common.AuditService;
import com.bcafly.common.ScopeValidator;
import com.bcafly.users.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/database-reset")
@PreAuthorize("hasRole('ADMIN')")
public class DatabaseResetController {

    private final DatabaseResetService resetService;
    private final ScopeValidator scopeValidator;
    private final AuditService auditService;

    public DatabaseResetController(DatabaseResetService resetService,
                                   ScopeValidator scopeValidator,
                                   AuditService auditService) {
        this.resetService = resetService;
        this.scopeValidator = scopeValidator;
        this.auditService = auditService;
    }

    /**
     * GET /api/admin/database-reset/preview
     */
    @GetMapping("/preview")
    public ResponseEntity<?> getResetPreview(
            @RequestParam(value = "mode", defaultValue = "academic-data") String mode,
            @RequestParam(value = "semesterId", required = false) Integer semesterId,
            @RequestParam(value = "academicYearId", defaultValue = "2024-25-even") String academicYearId) {

        Map<String, Object> preview = resetService.getResetPreview(mode, semesterId, academicYearId);
        return ResponseEntity.ok(preview);
    }

    /**
     * POST /api/admin/database-reset
     */
    @PostMapping
    public ResponseEntity<?> executeReset(@RequestBody Map<String, Object> payload) {
        String mode = (String) payload.getOrDefault("mode", "academic-data");
        Integer semesterId = payload.get("semesterId") != null ? Integer.parseInt(payload.get("semesterId").toString()) : null;
        String academicYearId = (String) payload.getOrDefault("academicYearId", "2024-25-even");
        String phrase = (String) payload.get("confirmationPhrase");
        boolean createBackup = Boolean.TRUE.equals(payload.get("createBackup"));

        User user = scopeValidator.getAuthenticatedUser();
        String requestedBy = user != null ? user.getName() : "Administrator";

        try {
            Map<String, Object> result = resetService.executeReset(
                    mode, semesterId, academicYearId, phrase, createBackup, requestedBy
            );
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Database reset failed: " + e.getMessage()
            ));
        }
    }
}
