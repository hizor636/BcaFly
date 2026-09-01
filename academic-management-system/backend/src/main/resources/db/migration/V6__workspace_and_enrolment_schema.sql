-- V6: Semester Workspaces, Student Enrolment, Batches, Rooms
-- Extends the academic core with workspace lifecycle, student enrolment tracking,
-- lab batch groupings, and classroom/laboratory registry.

-- Semester Workspace with lifecycle management
CREATE TABLE semester_workspaces (
    id                  BIGSERIAL       PRIMARY KEY,
    academic_year_id    BIGINT          NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    semester_id         BIGINT          NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    department          VARCHAR(50)     NOT NULL DEFAULT 'BCA',
    program             VARCHAR(50)     NOT NULL DEFAULT 'BCA',
    label               VARCHAR(100)    NOT NULL,
    status              VARCHAR(30)     NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','CONFIGURING','READY_FOR_REVIEW','ACTIVE','RECORDS_LOCKED','ARCHIVED')),
    activated_at        TIMESTAMP,
    locked_at           TIMESTAMP,
    archived_at         TIMESTAMP,
    created_by          BIGINT          REFERENCES users(id),
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_workspace UNIQUE (academic_year_id, semester_id, department)
);

-- Student lab batches within a workspace
CREATE TABLE student_batches (
    id                  BIGSERIAL       PRIMARY KEY,
    workspace_id        BIGINT          NOT NULL REFERENCES semester_workspaces(id) ON DELETE CASCADE,
    section_id          BIGINT          NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    name                VARCHAR(30)     NOT NULL,
    capacity            INT             DEFAULT 30,
    CONSTRAINT uq_batch UNIQUE (workspace_id, section_id, name)
);

-- Student semester enrolments
CREATE TABLE student_semester_enrolments (
    id                  BIGSERIAL       PRIMARY KEY,
    student_id          BIGINT          NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    workspace_id        BIGINT          NOT NULL REFERENCES semester_workspaces(id) ON DELETE CASCADE,
    semester_number     INT             NOT NULL CHECK (semester_number BETWEEN 1 AND 6),
    section_id          BIGINT          NOT NULL REFERENCES sections(id),
    batch_id            BIGINT          REFERENCES student_batches(id),
    academic_year_id    BIGINT          NOT NULL REFERENCES academic_years(id),
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','ACTIVE','DETAINED','WITHDRAWN','COMPLETED')),
    enrolled_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    effective_from      DATE            NOT NULL DEFAULT CURRENT_DATE,
    effective_to        DATE,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_workspace UNIQUE (student_id, workspace_id)
);

-- Workspace-specific course mapping
CREATE TABLE workspace_courses (
    id                  BIGSERIAL       PRIMARY KEY,
    workspace_id        BIGINT          NOT NULL REFERENCES semester_workspaces(id) ON DELETE CASCADE,
    subject_id          BIGINT          NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    room                VARCHAR(50),
    lab_room            VARCHAR(50),
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_ws_course UNIQUE (workspace_id, subject_id)
);

-- Per-student per-course enrolment
CREATE TABLE course_enrolments (
    id                  BIGSERIAL       PRIMARY KEY,
    student_id          BIGINT          NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    workspace_course_id BIGINT          NOT NULL REFERENCES workspace_courses(id) ON DELETE CASCADE,
    enrolment_id        BIGINT          NOT NULL REFERENCES student_semester_enrolments(id) ON DELETE CASCADE,
    status              VARCHAR(20)     NOT NULL DEFAULT 'ENROLLED'
                        CHECK (status IN ('ENROLLED','DROPPED','COMPLETED','FAILED')),
    enrolled_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_course_enrolment UNIQUE (student_id, workspace_course_id)
);

-- Classroom and laboratory registry
CREATE TABLE rooms (
    id                  BIGSERIAL       PRIMARY KEY,
    code                VARCHAR(30)     NOT NULL UNIQUE,
    name                VARCHAR(100)    NOT NULL,
    room_type           VARCHAR(20)     NOT NULL DEFAULT 'CLASSROOM'
                        CHECK (room_type IN ('CLASSROOM','LABORATORY','SEMINAR_HALL','AUDITORIUM')),
    building            VARCHAR(50)     DEFAULT 'Main Block',
    floor_number        INT             DEFAULT 0,
    capacity            INT             DEFAULT 60,
    has_projector       BOOLEAN         DEFAULT TRUE,
    has_ac              BOOLEAN         DEFAULT FALSE,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_ws_status ON semester_workspaces(status);
CREATE INDEX idx_ws_dept ON semester_workspaces(department);
CREATE INDEX idx_enrol_student ON student_semester_enrolments(student_id);
CREATE INDEX idx_enrol_workspace ON student_semester_enrolments(workspace_id, status);
CREATE INDEX idx_course_enrol_student ON course_enrolments(student_id);
CREATE INDEX idx_course_enrol_ws ON course_enrolments(workspace_course_id);

-- Seed: Create active Semester 3 workspace
INSERT INTO semester_workspaces (id, academic_year_id, semester_id, department, program, label, status, activated_at, created_by)
VALUES (1, 1, 3, 'BCA', 'BCA', 'BCA Semester 3 — 2026-27 ODD', 'ACTIVE', CURRENT_TIMESTAMP, 100)
ON CONFLICT (id) DO NOTHING;

SELECT setval('semester_workspaces_id_seq', (SELECT COALESCE(MAX(id), 1) FROM semester_workspaces));

-- Seed: Lab batches
INSERT INTO student_batches (id, workspace_id, section_id, name) VALUES
(1, 1, 3, 'Batch-1'),
(2, 1, 3, 'Batch-2')
ON CONFLICT (id) DO NOTHING;

SELECT setval('student_batches_id_seq', (SELECT COALESCE(MAX(id), 1) FROM student_batches));

-- Seed: Workspace courses for Semester 3
INSERT INTO workspace_courses (id, workspace_id, subject_id, room, lab_room) VALUES
(1, 1, 3, 'Room 301', NULL),
(2, 1, 4, 'Room 302', NULL)
ON CONFLICT (id) DO NOTHING;

SELECT setval('workspace_courses_id_seq', (SELECT COALESCE(MAX(id), 1) FROM workspace_courses));

-- Seed: Student semester enrolments
INSERT INTO student_semester_enrolments (id, student_id, workspace_id, semester_number, section_id, batch_id, academic_year_id, status, effective_from) VALUES
(1, 1, 1, 3, 3, 1, 1, 'ACTIVE', '2026-08-01'),
(2, 2, 1, 3, 3, 1, 1, 'ACTIVE', '2026-08-01'),
(3, 3, 1, 3, 3, 2, 1, 'ACTIVE', '2026-08-01')
ON CONFLICT (id) DO NOTHING;

SELECT setval('student_semester_enrolments_id_seq', (SELECT COALESCE(MAX(id), 1) FROM student_semester_enrolments));

-- Seed: Course enrolments
INSERT INTO course_enrolments (id, student_id, workspace_course_id, enrolment_id, status) VALUES
(1, 1, 1, 1, 'ENROLLED'),
(2, 1, 2, 1, 'ENROLLED'),
(3, 2, 1, 2, 'ENROLLED'),
(4, 2, 2, 2, 'ENROLLED'),
(5, 3, 1, 3, 'ENROLLED'),
(6, 3, 2, 3, 'ENROLLED')
ON CONFLICT (id) DO NOTHING;

SELECT setval('course_enrolments_id_seq', (SELECT COALESCE(MAX(id), 1) FROM course_enrolments));

-- Seed: Rooms
INSERT INTO rooms (id, code, name, room_type, building, floor_number, capacity) VALUES
(1, 'ROOM-301', 'Room 301', 'CLASSROOM', 'Main Block', 3, 60),
(2, 'ROOM-302', 'Room 302', 'CLASSROOM', 'Main Block', 3, 60),
(3, 'ROOM-303', 'Room 303', 'CLASSROOM', 'Main Block', 3, 60),
(4, 'LAB-1', 'Computer Lab 1', 'LABORATORY', 'Tech Block', 1, 30),
(5, 'LAB-2', 'Computer Lab 2', 'LABORATORY', 'Tech Block', 1, 30),
(6, 'SH-1', 'Seminar Hall A', 'SEMINAR_HALL', 'Admin Block', 2, 150)
ON CONFLICT (id) DO NOTHING;

SELECT setval('rooms_id_seq', (SELECT COALESCE(MAX(id), 1) FROM rooms));
