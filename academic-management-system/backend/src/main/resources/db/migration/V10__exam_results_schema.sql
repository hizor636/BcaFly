-- V10: Exam results and report export history
-- Final schema extension for semester examination outcomes and departmental reporting.

-- Semester exam results with publication control
CREATE TABLE exam_results (
    id                  BIGSERIAL       PRIMARY KEY,
    student_id          BIGINT          NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    workspace_id        BIGINT          NOT NULL REFERENCES semester_workspaces(id) ON DELETE CASCADE,
    subject_id          BIGINT          NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    semester_number     INT             NOT NULL CHECK (semester_number BETWEEN 1 AND 6),
    internal_marks      NUMERIC(5,2)    NOT NULL DEFAULT 0,
    external_marks      NUMERIC(5,2)    NOT NULL DEFAULT 0,
    total_marks         NUMERIC(5,2)    NOT NULL DEFAULT 0,
    max_marks           NUMERIC(5,2)    NOT NULL DEFAULT 100,
    grade               VARCHAR(5),
    grade_points        NUMERIC(4,2)    DEFAULT 0,
    credits             INT             NOT NULL DEFAULT 4,
    result_status       VARCHAR(10)     NOT NULL DEFAULT 'PENDING'
                        CHECK (result_status IN ('PENDING','PASS','FAIL','WITHHELD','ABSENT','MALPRACTICE')),
    publication_status  VARCHAR(20)     NOT NULL DEFAULT 'DRAFT'
                        CHECK (publication_status IN ('DRAFT','UNDER_REVIEW','PUBLISHED','LOCKED','CORRECTED')),
    published_at        TIMESTAMP,
    published_by        BIGINT          REFERENCES users(id),
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_result UNIQUE (student_id, workspace_id, subject_id)
);

-- Semester GPA summary per student per workspace
CREATE TABLE semester_gpa_records (
    id                  BIGSERIAL       PRIMARY KEY,
    student_id          BIGINT          NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    workspace_id        BIGINT          NOT NULL REFERENCES semester_workspaces(id) ON DELETE CASCADE,
    semester_number     INT             NOT NULL CHECK (semester_number BETWEEN 1 AND 6),
    total_credits       INT             NOT NULL DEFAULT 0,
    earned_credits      INT             NOT NULL DEFAULT 0,
    sgpa                NUMERIC(4,2)    NOT NULL DEFAULT 0.00,
    cgpa                NUMERIC(4,2)    NOT NULL DEFAULT 0.00,
    result_status       VARCHAR(10)     NOT NULL DEFAULT 'PENDING'
                        CHECK (result_status IN ('PENDING','PASS','FAIL','WITHHELD')),
    publication_status  VARCHAR(20)     NOT NULL DEFAULT 'DRAFT'
                        CHECK (publication_status IN ('DRAFT','PUBLISHED','LOCKED')),
    published_at        TIMESTAMP,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_gpa UNIQUE (student_id, workspace_id)
);

-- Report export history for audit trail
CREATE TABLE report_exports (
    id                  BIGSERIAL       PRIMARY KEY,
    report_type         VARCHAR(50)     NOT NULL,
    report_title        VARCHAR(200)    NOT NULL,
    workspace_id        BIGINT          REFERENCES semester_workspaces(id),
    export_format       VARCHAR(10)     NOT NULL DEFAULT 'CSV'
                        CHECK (export_format IN ('CSV','XLSX','PDF','JSON')),
    file_url            VARCHAR(500),
    record_count        INT             NOT NULL DEFAULT 0,
    exported_by         BIGINT          NOT NULL REFERENCES users(id),
    exported_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_result_student ON exam_results(student_id, publication_status);
CREATE INDEX idx_result_workspace ON exam_results(workspace_id, subject_id);
CREATE INDEX idx_gpa_student ON semester_gpa_records(student_id);
CREATE INDEX idx_gpa_workspace ON semester_gpa_records(workspace_id, publication_status);
CREATE INDEX idx_export_type ON report_exports(report_type, exported_at);
