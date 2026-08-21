-- V1: Core users table with role-based access control
CREATE TABLE users (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    role            VARCHAR(20)     NOT NULL DEFAULT 'STUDENT'
                    CHECK (role IN ('ADMIN', 'HOD', 'FACULTY', 'STUDENT')),
    department      VARCHAR(50)     NOT NULL DEFAULT 'BCA',
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for every sensitive action
CREATE TABLE audit_logs (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          REFERENCES users(id),
    action          VARCHAR(100)    NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       BIGINT,
    details         TEXT,
    ip_address      VARCHAR(45),
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
