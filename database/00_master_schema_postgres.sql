-- ====================================================================
-- BcaFly Academic Management System — Complete Master PostgreSQL Schema
-- Target: PostgreSQL 14 / 16 / 18+ (Port 5432)
-- Database: bcafly_db
-- ====================================================================

-- 1. USERS & RBAC CORE
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('ADMIN', 'HOD', 'FACULTY', 'STUDENT')),
    department      VARCHAR(50) NOT NULL DEFAULT 'BCA',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- 2. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       BIGINT,
    details         TEXT,
    ip_address      VARCHAR(45),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs (created_at DESC);

-- 3. ACADEMIC CALENDAR & CURRICULUM
CREATE TABLE IF NOT EXISTS academic_years (
    id          BIGSERIAL PRIMARY KEY,
    year_label  VARCHAR(20) NOT NULL UNIQUE,
    is_current  BOOLEAN NOT NULL DEFAULT FALSE,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS semesters (
    id                  BIGSERIAL PRIMARY KEY,
    academic_year_id    BIGINT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    semester_number     INT NOT NULL CHECK (semester_number BETWEEN 1 AND 8),
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS sections (
    id              BIGSERIAL PRIMARY KEY,
    semester_id     BIGINT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    name            VARCHAR(10) NOT NULL,
    CONSTRAINT uq_sem_sec UNIQUE (semester_id, name)
);

CREATE TABLE IF NOT EXISTS subjects (
    id                  BIGSERIAL PRIMARY KEY,
    code                VARCHAR(20) NOT NULL,
    title               VARCHAR(150) NOT NULL,
    credits             INT NOT NULL DEFAULT 4,
    semester_number     INT NOT NULL CHECK (semester_number BETWEEN 1 AND 8),
    max_internal_marks  INT NOT NULL DEFAULT 50,
    pass_internal_marks INT NOT NULL DEFAULT 20,
    academic_year_id    VARCHAR(50) DEFAULT '2026-27-ODD',
    course_type         VARCHAR(50) DEFAULT 'Core Theory',
    classroom_or_slot   VARCHAR(150) DEFAULT 'Room 301',
    assigned_faculty_id VARCHAR(50) DEFAULT 'FAC01',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_sub_sem UNIQUE (semester_number, academic_year_id, code)
);

CREATE INDEX IF NOT EXISTS idx_subjects_sem ON subjects (semester_number);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects (code);

-- 4. FACULTY & STUDENT PROFILES
CREATE TABLE IF NOT EXISTS faculty_profiles (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employee_code   VARCHAR(50) NOT NULL UNIQUE,
    designation     VARCHAR(100) NOT NULL DEFAULT 'Assistant Professor',
    department      VARCHAR(50) NOT NULL DEFAULT 'BCA',
    phone           VARCHAR(20),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_profiles (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    reg_no              VARCHAR(50) NOT NULL UNIQUE,
    roll_no             VARCHAR(50),
    current_semester_id BIGINT NULL REFERENCES semesters(id) ON DELETE SET NULL,
    section_id          BIGINT NULL REFERENCES sections(id) ON DELETE SET NULL,
    mentor_id           BIGINT NULL REFERENCES faculty_profiles(id) ON DELETE SET NULL,
    cgpa                NUMERIC(4,2) DEFAULT 0.00,
    attendance_pct      NUMERIC(5,2) DEFAULT 0.00,
    risk_status         VARCHAR(20) DEFAULT 'LOW'
);

CREATE TABLE IF NOT EXISTS students (
    id          VARCHAR(100) PRIMARY KEY,
    usn         VARCHAR(50) NOT NULL UNIQUE,
    full_name   VARCHAR(150) NOT NULL,
    email       VARCHAR(100),
    phone       VARCHAR(20),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_enrolments (
    id                      VARCHAR(100) PRIMARY KEY,
    student_id              VARCHAR(100) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    usn                     VARCHAR(50) NOT NULL,
    semester_id             INT NOT NULL CHECK (semester_id BETWEEN 1 AND 6),
    academic_year_id        VARCHAR(50) NOT NULL,
    section                 VARCHAR(1) DEFAULT 'A',
    batch                   VARCHAR(50) NOT NULL,
    roll_number             INT,
    enrolment_status        VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    attendance_percentage   NUMERIC(5,2) DEFAULT 85.00,
    current_sgpa            NUMERIC(4,2) DEFAULT 8.00,
    standing                VARCHAR(20) NOT NULL DEFAULT 'PASS',
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_sem_usn UNIQUE (usn, semester_id, academic_year_id)
);

CREATE INDEX IF NOT EXISTS idx_enrol_sem ON student_enrolments (semester_id);
CREATE INDEX IF NOT EXISTS idx_enrol_standing ON student_enrolments (standing);

CREATE TABLE IF NOT EXISTS faculty_course_assignments (
    id                  VARCHAR(100) PRIMARY KEY,
    faculty_id          VARCHAR(50) NOT NULL,
    faculty_name        VARCHAR(150) NOT NULL,
    course_code         VARCHAR(50) NOT NULL,
    semester_id         INT NOT NULL CHECK (semester_id BETWEEN 1 AND 6),
    academic_year_id    VARCHAR(50) NOT NULL,
    credits             INT DEFAULT 4,
    role                VARCHAR(50) DEFAULT 'PRIMARY',
    department          VARCHAR(50) DEFAULT 'BCA',
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_fac_sem_course UNIQUE (faculty_id, course_code, semester_id, academic_year_id)
);

-- 5. TIMETABLE & ATTENDANCE
CREATE TABLE IF NOT EXISTS timetable_entries (
    id                  BIGSERIAL PRIMARY KEY,
    semester_id         INT NOT NULL CHECK (semester_id BETWEEN 1 AND 6),
    academic_year_id    VARCHAR(50) DEFAULT '2026-27-ODD',
    day_of_week         VARCHAR(15) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    period_number       INT NOT NULL CHECK (period_number BETWEEN 1 AND 8),
    course_code         VARCHAR(50) NOT NULL,
    course_title        VARCHAR(150),
    faculty_id          VARCHAR(50) NOT NULL,
    faculty_name        VARCHAR(150),
    room_code           VARCHAR(50) DEFAULT 'Room 301',
    start_time          TIME DEFAULT '09:00:00',
    end_time            TIME DEFAULT '09:55:00',
    session_type        VARCHAR(50) DEFAULT 'Lecture',
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_sem_day_period UNIQUE (semester_id, academic_year_id, day_of_week, period_number)
);

CREATE TABLE IF NOT EXISTS attendance_sessions (
    id                  BIGSERIAL PRIMARY KEY,
    faculty_id          BIGINT NOT NULL REFERENCES faculty_profiles(id),
    subject_id          BIGINT NOT NULL REFERENCES subjects(id),
    section_id          BIGINT NOT NULL REFERENCES sections(id),
    semester_id         BIGINT NOT NULL REFERENCES semesters(id),
    session_date        DATE NOT NULL,
    period_number       INT NOT NULL DEFAULT 1,
    topic               VARCHAR(255),
    status              VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'LOCKED')),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_attendance (
    id              BIGSERIAL PRIMARY KEY,
    session_id      BIGINT NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id      BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    is_present      BOOLEAN NOT NULL DEFAULT TRUE,
    is_od           BOOLEAN NOT NULL DEFAULT FALSE,
    remarks         VARCHAR(255),
    CONSTRAINT uq_session_student UNIQUE (session_id, student_id)
);

-- 6. MARKS & EXAM RESULTS
CREATE TABLE IF NOT EXISTS internal_marks (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    subject_id          BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    semester_id         BIGINT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    test_name           VARCHAR(50) NOT NULL,
    marks_obtained      NUMERIC(5,2) NOT NULL,
    max_marks           NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'RETURNED')),
    submitted_by        BIGINT NULL,
    approved_by         BIGINT NULL,
    remarks             VARCHAR(255),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_marks UNIQUE (student_id, subject_id, test_name)
);

CREATE TABLE IF NOT EXISTS exam_results (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    subject_id          BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    semester_number     INT NOT NULL CHECK (semester_number BETWEEN 1 AND 6),
    internal_marks      NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    external_marks      NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    total_marks         NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    max_marks           NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    grade               VARCHAR(5),
    grade_points        NUMERIC(4,2) DEFAULT 0.00,
    credits             INT NOT NULL DEFAULT 4,
    result_status       VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (result_status IN ('PENDING', 'PASS', 'FAIL', 'WITHHELD', 'ABSENT', 'MALPRACTICE')),
    publication_status  VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (publication_status IN ('DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'LOCKED', 'CORRECTED')),
    published_at        TIMESTAMP WITH TIME ZONE NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. NOTIFICATIONS & HELPDESK
CREATE TABLE IF NOT EXISTS notifications (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               VARCHAR(200) NOT NULL,
    message             TEXT NOT NULL,
    notification_type   VARCHAR(30) NOT NULL DEFAULT 'GENERAL',
    link                VARCHAR(200),
    is_read             BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS helpdesk_tickets (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    category            VARCHAR(50) NOT NULL,
    subject             VARCHAR(200) NOT NULL,
    description         TEXT NOT NULL,
    priority            VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status              VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REOPENED', 'CLOSED')),
    assigned_to         BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    resolution_deadline TIMESTAMP WITH TIME ZONE NULL,
    resolved_at         TIMESTAMP WITH TIME ZONE NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA (Password: password -> BCrypt hash)
INSERT INTO users (id, name, email, password_hash, role, department) VALUES
(1, 'Administrator', 'admin@bcafly.edu', '$2a$10$7Q9b9K1tHkP4E.V6jG1sYe.N4X8Yq4A.5YhXzQ9yB6Hq.R8q8v7tG', 'ADMIN', 'BCA'),
(2, 'Dr. Anand Sharma', 'hod@bcafly.edu', '$2a$10$7Q9b9K1tHkP4E.V6jG1sYe.N4X8Yq4A.5YhXzQ9yB6Hq.R8q8v7tG', 'HOD', 'BCA'),
(3, 'Prof. Kavitha Rao', 'faculty@bcafly.edu', '$2a$10$7Q9b9K1tHkP4E.V6jG1sYe.N4X8Yq4A.5YhXzQ9yB6Hq.R8q8v7tG', 'FACULTY', 'BCA'),
(4, 'Aakash Singh', 'student@bcafly.edu', '$2a$10$7Q9b9K1tHkP4E.V6jG1sYe.N4X8Yq4A.5YhXzQ9yB6Hq.R8q8v7tG', 'STUDENT', 'BCA')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO academic_years (id, year_label, is_current, start_date, end_date) VALUES
(1, '2026–2027', TRUE, '2026-08-01', '2027-05-31')
ON CONFLICT (id) DO UPDATE SET is_current = EXCLUDED.is_current;

INSERT INTO semesters (id, academic_year_id, semester_number, start_date, end_date, is_active) VALUES
(1, 1, 1, '2026-08-01', '2026-12-20', TRUE),
(2, 1, 2, '2027-01-05', '2027-05-20', TRUE),
(3, 1, 3, '2026-08-01', '2026-12-20', TRUE),
(4, 1, 4, '2027-01-05', '2027-05-20', TRUE),
(5, 1, 5, '2026-08-01', '2026-12-20', TRUE),
(6, 1, 6, '2027-01-05', '2027-05-20', TRUE)
ON CONFLICT (id) DO UPDATE SET is_active = EXCLUDED.is_active;

INSERT INTO sections (id, semester_id, name) VALUES
(1, 1, 'A'), (2, 1, 'B'),
(3, 3, 'A'), (4, 3, 'B'),
(5, 5, 'A'), (6, 5, 'B')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 8. SYNCHRONIZE SEQUENCES (Ensures auto-increment works smoothly after manual ID inserts)
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval(pg_get_serial_sequence('academic_years', 'id'), COALESCE((SELECT MAX(id) FROM academic_years), 1));
SELECT setval(pg_get_serial_sequence('semesters', 'id'), COALESCE((SELECT MAX(id) FROM semesters), 1));
SELECT setval(pg_get_serial_sequence('sections', 'id'), COALESCE((SELECT MAX(id) FROM sections), 1));

