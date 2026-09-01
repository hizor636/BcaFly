-- V8: Student risk cases, backlog records, approval requests, faculty allocations, record locks
-- Governance entities for HOD oversight, intervention management, and academic accountability.

-- At-risk student intervention tracking
CREATE TABLE student_risk_cases (
    id                  BIGSERIAL       PRIMARY KEY,
    student_id          BIGINT          NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    workspace_id        BIGINT          NOT NULL REFERENCES semester_workspaces(id) ON DELETE CASCADE,
    risk_level          VARCHAR(10)     NOT NULL DEFAULT 'MEDIUM'
                        CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    risk_reasons        TEXT            NOT NULL,
    attendance_pct      NUMERIC(5,2),
    sgpa                NUMERIC(4,2),
    mentor_id           BIGINT          REFERENCES faculty_profiles(id),
    intervention_plan   TEXT,
    status              VARCHAR(30)     NOT NULL DEFAULT 'IDENTIFIED'
                        CHECK (status IN ('IDENTIFIED','MENTOR_ASSIGNED','COUNSELING_SCHEDULED','IN_PROGRESS','RESOLVED','ESCALATED')),
    next_review_date    DATE,
    created_by          BIGINT          REFERENCES users(id),
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Standing arrear / backlog records
CREATE TABLE backlog_records (
    id                  BIGSERIAL       PRIMARY KEY,
    student_id          BIGINT          NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    subject_id          BIGINT          NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    workspace_id        BIGINT          NOT NULL REFERENCES semester_workspaces(id) ON DELETE CASCADE,
    exam_session        VARCHAR(50)     NOT NULL,
    attempt_count       INT             NOT NULL DEFAULT 1,
    marks_obtained      NUMERIC(5,2)    NOT NULL DEFAULT 0,
    max_marks           NUMERIC(5,2)    NOT NULL DEFAULT 100,
    mentor_id           BIGINT          REFERENCES faculty_profiles(id),
    remedial_plan       TEXT,
    remedial_attendance_pct NUMERIC(5,2) DEFAULT 0,
    re_exam_eligibility VARCHAR(20)     NOT NULL DEFAULT 'PENDING'
                        CHECK (re_exam_eligibility IN ('PENDING','ELIGIBLE','NOT_ELIGIBLE','APPEARED')),
    status              VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE','IN_PROGRESS','RE_EXAM_ELIGIBLE','AWAITING_RESULT','CLEARED')),
    cleared_at          TIMESTAMP,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_backlog UNIQUE (student_id, subject_id, exam_session)
);

-- Unified approval request queue (OD, attendance corrections, marks corrections, document requests)
CREATE TABLE approval_requests (
    id                  BIGSERIAL       PRIMARY KEY,
    request_type        VARCHAR(30)     NOT NULL
                        CHECK (request_type IN ('OD_CLAIM','ATTENDANCE_CORRECTION','MARKS_CORRECTION','DOCUMENT_REQUEST','REVALUATION','ENROLMENT_CHANGE')),
    requester_id        BIGINT          NOT NULL REFERENCES users(id),
    workspace_id        BIGINT          REFERENCES semester_workspaces(id),
    reference_id        BIGINT,
    reference_type      VARCHAR(50),
    title               VARCHAR(200)    NOT NULL,
    description         TEXT,
    evidence_url        VARCHAR(500),
    faculty_status      VARCHAR(20)     NOT NULL DEFAULT 'PENDING'
                        CHECK (faculty_status IN ('PENDING','RECOMMENDED','NOT_RECOMMENDED','NA')),
    faculty_remarks     TEXT,
    faculty_reviewed_by BIGINT          REFERENCES users(id),
    faculty_reviewed_at TIMESTAMP,
    hod_status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING'
                        CHECK (hod_status IN ('PENDING','APPROVED','REJECTED','RETURNED')),
    hod_remarks         TEXT,
    hod_reviewed_by     BIGINT          REFERENCES users(id),
    hod_reviewed_at     TIMESTAMP,
    final_status        VARCHAR(20)     NOT NULL DEFAULT 'DRAFT'
                        CHECK (final_status IN ('DRAFT','SUBMITTED','FACULTY_REVIEWED','HOD_APPROVED','HOD_REJECTED','RETURNED','COMPLETED')),
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Faculty course allocations with workload tracking
CREATE TABLE faculty_course_allocations (
    id                  BIGSERIAL       PRIMARY KEY,
    faculty_id          BIGINT          NOT NULL REFERENCES faculty_profiles(id) ON DELETE CASCADE,
    workspace_course_id BIGINT          NOT NULL REFERENCES workspace_courses(id) ON DELETE CASCADE,
    workspace_id        BIGINT          NOT NULL REFERENCES semester_workspaces(id) ON DELETE CASCADE,
    allocation_type     VARCHAR(20)     NOT NULL DEFAULT 'THEORY'
                        CHECK (allocation_type IN ('THEORY','LAB','TUTORIAL','REMEDIAL')),
    weekly_hours        INT             NOT NULL DEFAULT 4,
    status              VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE','INACTIVE','RELIEVED','SUBSTITUTE')),
    allocated_by        BIGINT          REFERENCES users(id),
    allocated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_faculty_alloc UNIQUE (faculty_id, workspace_course_id)
);

-- Academic record locks (prevents post-term tampering)
CREATE TABLE academic_record_locks (
    id                  BIGSERIAL       PRIMARY KEY,
    workspace_id        BIGINT          NOT NULL REFERENCES semester_workspaces(id) ON DELETE CASCADE,
    lock_type           VARCHAR(30)     NOT NULL DEFAULT 'FULL'
                        CHECK (lock_type IN ('ATTENDANCE','MARKS','RESULTS','FULL')),
    locked_by           BIGINT          NOT NULL REFERENCES users(id),
    locked_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason              VARCHAR(200),
    CONSTRAINT uq_record_lock UNIQUE (workspace_id, lock_type)
);

-- Indexes
CREATE INDEX idx_risk_student ON student_risk_cases(student_id, risk_level);
CREATE INDEX idx_risk_workspace ON student_risk_cases(workspace_id, status);
CREATE INDEX idx_backlog_student ON backlog_records(student_id, status);
CREATE INDEX idx_backlog_workspace ON backlog_records(workspace_id);
CREATE INDEX idx_approval_type ON approval_requests(request_type, final_status);
CREATE INDEX idx_approval_requester ON approval_requests(requester_id);
CREATE INDEX idx_fac_alloc_faculty ON faculty_course_allocations(faculty_id, status);
CREATE INDEX idx_fac_alloc_workspace ON faculty_course_allocations(workspace_id);
