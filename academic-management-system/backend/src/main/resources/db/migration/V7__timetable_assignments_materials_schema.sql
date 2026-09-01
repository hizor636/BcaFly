-- V7: Timetable entries, assignments, submissions, course materials, attendance corrections
-- Extends academic operations with content creation, submission workflow, and correction appeals.

-- Timetable entries with publication control
CREATE TABLE timetable_entries (
    id                  BIGSERIAL       PRIMARY KEY,
    workspace_id        BIGINT          NOT NULL REFERENCES semester_workspaces(id) ON DELETE CASCADE,
    workspace_course_id BIGINT          NOT NULL REFERENCES workspace_courses(id) ON DELETE CASCADE,
    section_id          BIGINT          NOT NULL REFERENCES sections(id),
    faculty_id          BIGINT          REFERENCES faculty_profiles(id),
    room_id             BIGINT          REFERENCES rooms(id),
    day_of_week         VARCHAR(10)     NOT NULL
                        CHECK (day_of_week IN ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY')),
    period_number       INT             NOT NULL CHECK (period_number BETWEEN 1 AND 8),
    start_time          TIME            NOT NULL,
    end_time            TIME            NOT NULL,
    session_type        VARCHAR(20)     NOT NULL DEFAULT 'LECTURE'
                        CHECK (session_type IN ('LECTURE','LAB','TUTORIAL','SEMINAR')),
    status              VARCHAR(20)     NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','PUBLISHED','CANCELLED','SUBSTITUTED')),
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_timetable_slot UNIQUE (workspace_id, section_id, day_of_week, period_number)
);

-- Faculty-created assignments with publication & late-submission controls
CREATE TABLE assignments (
    id                  BIGSERIAL       PRIMARY KEY,
    workspace_course_id BIGINT          NOT NULL REFERENCES workspace_courses(id) ON DELETE CASCADE,
    created_by          BIGINT          NOT NULL REFERENCES faculty_profiles(id),
    title               VARCHAR(200)    NOT NULL,
    description         TEXT,
    instructions        TEXT,
    max_marks           INT             NOT NULL DEFAULT 20,
    weightage           NUMERIC(5,2)    DEFAULT 10.0,
    assigned_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_at              TIMESTAMP       NOT NULL,
    allow_late          BOOLEAN         NOT NULL DEFAULT TRUE,
    allow_resubmission  BOOLEAN         NOT NULL DEFAULT TRUE,
    status              VARCHAR(20)     NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','PUBLISHED','CLOSED','ARCHIVED')),
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Student assignment submissions with grading
CREATE TABLE assignment_submissions (
    id                  BIGSERIAL       PRIMARY KEY,
    assignment_id       BIGINT          NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id          BIGINT          NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    submission_text     TEXT,
    submission_links    TEXT,
    marks_obtained      NUMERIC(5,2),
    feedback            TEXT,
    status              VARCHAR(20)     NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','SUBMITTED','LATE','GRADED','RETURNED','RESUBMITTED')),
    graded_by           BIGINT          REFERENCES faculty_profiles(id),
    graded_at           TIMESTAMP,
    submitted_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_submission UNIQUE (assignment_id, student_id)
);

-- Course materials with unit-wise organization and publication controls
CREATE TABLE course_materials (
    id                  BIGSERIAL       PRIMARY KEY,
    workspace_course_id BIGINT          NOT NULL REFERENCES workspace_courses(id) ON DELETE CASCADE,
    uploaded_by         BIGINT          NOT NULL REFERENCES faculty_profiles(id),
    title               VARCHAR(200)    NOT NULL,
    description         TEXT,
    material_type       VARCHAR(30)     NOT NULL DEFAULT 'PDF'
                        CHECK (material_type IN ('PDF','SLIDES','VIDEO','LINK','CODE','REFERENCE','NOTES')),
    unit_number         INT             NOT NULL DEFAULT 1 CHECK (unit_number BETWEEN 1 AND 10),
    file_url            VARCHAR(500),
    file_size           VARCHAR(20),
    is_visible          BOOLEAN         NOT NULL DEFAULT TRUE,
    published_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Student attendance correction requests (appeal workflow)
CREATE TABLE attendance_correction_requests (
    id                  BIGSERIAL       PRIMARY KEY,
    student_id          BIGINT          NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    session_id          BIGINT          NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    reason              TEXT            NOT NULL,
    evidence_url        VARCHAR(500),
    status              VARCHAR(20)     NOT NULL DEFAULT 'SUBMITTED'
                        CHECK (status IN ('SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','ESCALATED_TO_HOD')),
    faculty_remarks     TEXT,
    hod_remarks         TEXT,
    reviewed_by         BIGINT          REFERENCES users(id),
    reviewed_at         TIMESTAMP,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_timetable_ws ON timetable_entries(workspace_id, day_of_week);
CREATE INDEX idx_timetable_faculty ON timetable_entries(faculty_id);
CREATE INDEX idx_assignment_course ON assignments(workspace_course_id, status);
CREATE INDEX idx_submission_student ON assignment_submissions(student_id);
CREATE INDEX idx_submission_assignment ON assignment_submissions(assignment_id, status);
CREATE INDEX idx_material_course ON course_materials(workspace_course_id, is_visible);
CREATE INDEX idx_att_correction ON attendance_correction_requests(student_id, status);
