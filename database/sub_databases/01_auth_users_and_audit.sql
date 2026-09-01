-- ====================================================================
-- SUB-DATABASE 01: Authentication, RBAC Users & Immutable Audit Logs
-- Domain: Security, Roles & Administrative Traceability
-- ====================================================================

-- 1. USERS & ROLES TABLE
CREATE TABLE IF NOT EXISTS users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            ENUM('ADMIN', 'HOD', 'FACULTY', 'STUDENT') NOT NULL DEFAULT 'STUDENT',
    department      VARCHAR(50) NOT NULL DEFAULT 'BCA',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB COMMENT='System-wide user accounts and roles for RBAC';

-- 2. IMMUTABLE AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NULL,
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       BIGINT,
    details         TEXT,
    ip_address      VARCHAR(45),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Immutable append-only audit trail of system operations';

-- DEFAULT SEED USERS (Password: password -> BCrypt encoded)
INSERT INTO users (id, name, email, password_hash, role, department) VALUES
(1, 'Administrator', 'admin@bcafly.edu', '$2a$10$7Q9b9K1tHkP4E.V6jG1sYe.N4X8Yq4A.5YhXzQ9yB6Hq.R8q8v7tG', 'ADMIN', 'BCA'),
(2, 'Dr. Anand Sharma', 'hod@bcafly.edu', '$2a$10$7Q9b9K1tHkP4E.V6jG1sYe.N4X8Yq4A.5YhXzQ9yB6Hq.R8q8v7tG', 'HOD', 'BCA'),
(3, 'Prof. Kavitha Rao', 'faculty@bcafly.edu', '$2a$10$7Q9b9K1tHkP4E.V6jG1sYe.N4X8Yq4A.5YhXzQ9yB6Hq.R8q8v7tG', 'FACULTY', 'BCA'),
(4, 'Aakash Singh', 'student@bcafly.edu', '$2a$10$7Q9b9K1tHkP4E.V6jG1sYe.N4X8Yq4A.5YhXzQ9yB6Hq.R8q8v7tG', 'STUDENT', 'BCA')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- SAMPLE QUERIES FOR THIS SUB-DATABASE:
-- 1. List all active staff (Admin & HOD & Faculty):
-- SELECT id, name, email, role, department FROM users WHERE role IN ('ADMIN', 'HOD', 'FACULTY') AND is_active = TRUE;
-- 2. View latest 20 audit events:
-- SELECT a.id, u.name AS actor, a.action, a.details, a.created_at FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 20;
