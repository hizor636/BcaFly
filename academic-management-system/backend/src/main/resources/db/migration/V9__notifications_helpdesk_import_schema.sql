-- V9: Notifications, helpdesk tickets, document requests, import jobs, stored files
-- Support entities for student services, file management, and data import tracking.

-- Per-user notifications with type and read-status tracking
CREATE TABLE notifications (
    id                  BIGSERIAL       PRIMARY KEY,
    user_id             BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               VARCHAR(200)    NOT NULL,
    message             TEXT            NOT NULL,
    notification_type   VARCHAR(30)     NOT NULL DEFAULT 'GENERAL'
                        CHECK (notification_type IN ('GENERAL','ATTENDANCE','MARKS','ASSIGNMENT','MATERIAL','RESULT','TIMETABLE','ANNOUNCEMENT','ACTIVITY','HELPDESK','APPROVAL','SYSTEM')),
    link                VARCHAR(200),
    is_read             BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Helpdesk tickets for student support
CREATE TABLE helpdesk_tickets (
    id                  BIGSERIAL       PRIMARY KEY,
    student_id          BIGINT          NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    category            VARCHAR(50)     NOT NULL,
    subject             VARCHAR(200)    NOT NULL,
    description         TEXT            NOT NULL,
    priority            VARCHAR(10)     NOT NULL DEFAULT 'MEDIUM'
                        CHECK (priority IN ('LOW','MEDIUM','HIGH','URGENT')),
    status              VARCHAR(20)     NOT NULL DEFAULT 'OPEN'
                        CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED','REOPENED','CLOSED')),
    assigned_to         BIGINT          REFERENCES users(id),
    resolution_deadline TIMESTAMP,
    resolved_at         TIMESTAMP,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Helpdesk ticket reply thread
CREATE TABLE helpdesk_replies (
    id                  BIGSERIAL       PRIMARY KEY,
    ticket_id           BIGINT          NOT NULL REFERENCES helpdesk_tickets(id) ON DELETE CASCADE,
    author_id           BIGINT          NOT NULL REFERENCES users(id),
    author_role         VARCHAR(20)     NOT NULL DEFAULT 'STUDENT',
    message             TEXT            NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Official document requests (bonafide, transcript, ID card)
CREATE TABLE document_requests (
    id                  BIGSERIAL       PRIMARY KEY,
    student_id          BIGINT          NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    document_type       VARCHAR(50)     NOT NULL,
    purpose             VARCHAR(200)    NOT NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'SUBMITTED'
                        CHECK (status IN ('SUBMITTED','IN_PROCESS','READY','ISSUED','REJECTED')),
    issued_at           TIMESTAMP,
    download_url        VARCHAR(500),
    processed_by        BIGINT          REFERENCES users(id),
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CSV/XLSX import job tracking
CREATE TABLE import_jobs (
    id                  BIGSERIAL       PRIMARY KEY,
    import_type         VARCHAR(30)     NOT NULL DEFAULT 'STUDENT'
                        CHECK (import_type IN ('STUDENT','COURSE','FACULTY','TIMETABLE','MARKS','ATTENDANCE')),
    workspace_id        BIGINT          REFERENCES semester_workspaces(id),
    file_name           VARCHAR(255)    NOT NULL,
    file_path           VARCHAR(500),
    total_rows          INT             NOT NULL DEFAULT 0,
    valid_rows          INT             NOT NULL DEFAULT 0,
    error_rows          INT             NOT NULL DEFAULT 0,
    imported_rows       INT             NOT NULL DEFAULT 0,
    status              VARCHAR(30)     NOT NULL DEFAULT 'UPLOADED'
                        CHECK (status IN ('UPLOADED','VALIDATING','VALIDATION_FAILED','READY_FOR_IMPORT','IMPORTING','COMPLETED','PARTIALLY_COMPLETED','ROLLED_BACK','FAILED')),
    error_report_url    VARCHAR(500),
    started_at          TIMESTAMP,
    completed_at        TIMESTAMP,
    imported_by         BIGINT          NOT NULL REFERENCES users(id),
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Import row-level errors
CREATE TABLE import_errors (
    id                  BIGSERIAL       PRIMARY KEY,
    import_job_id       BIGINT          NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
    row_number          INT             NOT NULL,
    column_name         VARCHAR(50),
    value               VARCHAR(500),
    error_message       VARCHAR(500)    NOT NULL,
    severity            VARCHAR(10)     NOT NULL DEFAULT 'ERROR'
                        CHECK (severity IN ('WARNING','ERROR','CRITICAL'))
);

-- Secure file metadata registry
CREATE TABLE stored_files (
    id                  BIGSERIAL       PRIMARY KEY,
    original_name       VARCHAR(255)    NOT NULL,
    stored_name         VARCHAR(255)    NOT NULL UNIQUE,
    file_extension      VARCHAR(10)     NOT NULL,
    mime_type           VARCHAR(100)    NOT NULL DEFAULT 'application/octet-stream',
    file_size_bytes     BIGINT          NOT NULL DEFAULT 0,
    storage_path        VARCHAR(500)    NOT NULL,
    context_type        VARCHAR(30)     NOT NULL DEFAULT 'GENERAL'
                        CHECK (context_type IN ('GENERAL','ASSIGNMENT','MATERIAL','EVIDENCE','IMPORT','EXPORT','PROFILE_PHOTO','DOCUMENT')),
    context_id          BIGINT,
    uploaded_by         BIGINT          NOT NULL REFERENCES users(id),
    is_public           BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notif_user ON notifications(user_id, is_read);
CREATE INDEX idx_notif_type ON notifications(notification_type);
CREATE INDEX idx_ticket_student ON helpdesk_tickets(student_id, status);
CREATE INDEX idx_ticket_assigned ON helpdesk_tickets(assigned_to);
CREATE INDEX idx_doc_student ON document_requests(student_id, status);
CREATE INDEX idx_import_status ON import_jobs(status, import_type);
CREATE INDEX idx_import_errors_job ON import_errors(import_job_id);
CREATE INDEX idx_file_context ON stored_files(context_type, context_id);
