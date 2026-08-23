package com.bcafly.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Secure file upload and validation service.
 * Enforces OWASP file upload safety rules:
 * - Allowlist of acceptable extensions
 * - Strict blocklist for executables and scripts
 * - Sanitized unique server-side file naming (UUID)
 * - Storage in protected directory outside public webroot
 * - Audit logging of all file uploads and deletions
 */
@Service
public class SecureFileUploadService {

    private static final long MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "docx", "pptx", "xlsx", "csv", "jpg", "jpeg", "png", "zip"
    );

    private static final Set<String> PROHIBITED_EXTENSIONS = Set.of(
            "exe", "sh", "bat", "cmd", "vbs", "js", "py", "php", "jsp", "asp", "aspx", "com", "scr", "apk", "jar"
    );

    @Value("${app.storage.upload-dir:../storage/uploads}")
    private String uploadDir;

    private final AuditService auditService;
    private final ScopeValidator scopeValidator;

    public SecureFileUploadService(AuditService auditService, ScopeValidator scopeValidator) {
        this.auditService = auditService;
        this.scopeValidator = scopeValidator;
    }

    public StoredFileResult storeFile(MultipartFile file, String contextType, Long contextId) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("File size (" + (file.getSize() / 1024 / 1024) + " MB) exceeds 25 MB limit.");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new IllegalArgumentException("Invalid file name.");
        }

        String ext = getFileExtension(originalName).toLowerCase();

        if (PROHIBITED_EXTENSIONS.contains(ext)) {
            throw new SecurityException("Executable or script file type (." + ext + ") is strictly prohibited for security.");
        }

        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("Unsupported file type (." + ext + "). Allowed: " + String.join(", ", ALLOWED_EXTENSIONS));
        }

        // Generate unique, sanitized server-side filename (UUID)
        String storedName = UUID.randomUUID().toString() + "." + ext;

        // Ensure storage directory exists outside public folder
        Path targetDirPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(targetDirPath);

        Path targetFilePath = targetDirPath.resolve(storedName);

        // Security check: verify path traversal attempt
        if (!targetFilePath.getParent().equals(targetDirPath)) {
            throw new SecurityException("Invalid file storage path.");
        }

        // Copy file
        Files.copy(file.getInputStream(), targetFilePath, StandardCopyOption.REPLACE_EXISTING);

        // Log to immutable audit log
        auditService.log(
                "FILE_UPLOADED",
                "StoredFile",
                null,
                String.format("Uploaded '%s' as '%s' (%s, %d KB) for %s #%d",
                        originalName, storedName, ext.toUpperCase(), file.getSize() / 1024, contextType, contextId)
        );

        return new StoredFileResult(
                originalName,
                storedName,
                ext.toUpperCase(),
                file.getSize(),
                targetFilePath.toString()
        );
    }

    public void deleteFile(String storedName) throws IOException {
        Path targetDirPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path filePath = targetDirPath.resolve(storedName);

        if (Files.exists(filePath)) {
            Files.delete(filePath);
            auditService.log("FILE_DELETED", "StoredFile", null, "Deleted stored file: " + storedName);
        }
    }

    private String getFileExtension(String fileName) {
        int dotIdx = fileName.lastIndexOf('.');
        if (dotIdx == -1 || dotIdx == fileName.length() - 1) return "";
        return fileName.substring(dotIdx + 1);
    }

    public record StoredFileResult(
            String originalName,
            String storedName,
            String extension,
            long sizeBytes,
            String storagePath
    ) {}
}
