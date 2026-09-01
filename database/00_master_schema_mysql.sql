-- ====================================================================
-- BcaFly Academic Management System — Complete Master MySQL Schema
-- Target: MySQL 8.0+ (Port 3306)
-- Database: bcafly_db
-- ====================================================================

CREATE DATABASE IF NOT EXISTS bcafly_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bcafly_db;

-- 1. USERS & AUDIT
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
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 2. ACADEMIC CALENDAR & CURRICULUM
CREATE TABLE IF NOT EXISTS academic_years (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    year_label  VARCHAR(20) NOT NULL UNIQUE,
    is_current  BOOLEAN NOT NULL DEFAULT FALSE,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS semesters (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    academic_year_id    BIGINT NOT NULL,
    semester_number     INT NOT NULL CHECK (semester_number BETWEEN 1 AND 8),
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sections (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    semester_id     BIGINT NOT NULL,
    name            VARCHAR(10) NOT NULL,
    CONSTRAINT uq_sem_sec UNIQUE (semester_id, name),
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS subjects (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
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
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_sub_sem (semester_number, academic_year_id, code)
) ENGINE=InnoDB;

-- 3. PROFILES & ENROLMENTS
CREATE TABLE IF NOT EXISTS faculty_profiles (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE,
    employee_code   VARCHAR(50) NOT NULL UNIQUE,
    designation     VARCHAR(100) NOT NULL DEFAULT 'Assistant Professor',
    department      VARCHAR(50) NOT NULL DEFAULT 'BCA',
    phone           VARCHAR(20),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_profiles (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT NOT NULL UNIQUE,
    reg_no              VARCHAR(50) NOT NULL UNIQUE,
    roll_no             VARCHAR(50),
    current_semester_id BIGINT NULL,
    section_id          BIGINT NULL,
    mentor_id           BIGINT NULL,
    cgpa                DECIMAL(4,2) DEFAULT 0.00,
    attendance_pct      DECIMAL(5,2) DEFAULT 0.00,
    risk_status         VARCHAR(20) DEFAULT 'LOW',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (current_semester_id) REFERENCES semesters(id) ON DELETE SET NULL,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL,
    FOREIGN KEY (mentor_id) REFERENCES faculty_profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS students (
    id          VARCHAR(100) PRIMARY KEY,
    usn         VARCHAR(50) NOT NULL UNIQUE,
    full_name   VARCHAR(150) NOT NULL,
    email       VARCHAR(100),
    phone       VARCHAR(20),
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_enrolments (
    id                      VARCHAR(100) PRIMARY KEY,
    student_id              VARCHAR(100) NOT NULL,
    usn                     VARCHAR(50) NOT NULL,
    semester_id             INT NOT NULL CHECK (semester_id BETWEEN 1 AND 6),
    academic_year_id        VARCHAR(50) NOT NULL,
    section                 VARCHAR(1) DEFAULT 'A',
    batch                   VARCHAR(50) NOT NULL,
    roll_number             INT,
    enrolment_status        VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    attendance_percentage   DECIMAL(5,2) DEFAULT 85.00,
    current_sgpa            DECIMAL(4,2) DEFAULT 8.00,
    standing                VARCHAR(20) NOT NULL DEFAULT 'PASS',
    created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_sem_usn (usn, semester_id, academic_year_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

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
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_fac_sem_course (faculty_id, course_code, semester_id, academic_year_id)
) ENGINE=InnoDB;

-- 4. TIMETABLE & ATTENDANCE
CREATE TABLE IF NOT EXISTS timetable_entries (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    semester_id         INT NOT NULL CHECK (semester_id BETWEEN 1 AND 6),
    academic_year_id    VARCHAR(50) DEFAULT '2026-27-ODD',
    day_of_week         ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    period_number       INT NOT NULL CHECK (period_number BETWEEN 1 AND 8),
    course_code         VARCHAR(50) NOT NULL,
    course_title        VARCHAR(150),
    faculty_id          VARCHAR(50) NOT NULL,
    faculty_name        VARCHAR(150),
    room_code           VARCHAR(50) DEFAULT 'Room 301',
    start_time          TIME DEFAULT '09:00:00',
    end_time            TIME DEFAULT '09:55:00',
    session_type        VARCHAR(50) DEFAULT 'Lecture',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_sem_day_period (semester_id, academic_year_id, day_of_week, period_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attendance_sessions (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    faculty_id          BIGINT NOT NULL,
    subject_id          BIGINT NOT NULL,
    section_id          BIGINT NOT NULL,
    semester_id         BIGINT NOT NULL,
    session_date        DATE NOT NULL,
    period_number       INT NOT NULL DEFAULT 1,
    topic               VARCHAR(255),
    status              ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'LOCKED') NOT NULL DEFAULT 'SUBMITTED',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty_profiles(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (section_id) REFERENCES sections(id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_attendance (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id      BIGINT NOT NULL,
    student_id      BIGINT NOT NULL,
    is_present      BOOLEAN NOT NULL DEFAULT TRUE,
    is_od           BOOLEAN NOT NULL DEFAULT FALSE,
    remarks         VARCHAR(255),
    CONSTRAINT uq_session_student UNIQUE (session_id, student_id),
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. MARKS & EXAM RESULTS
CREATE TABLE IF NOT EXISTS internal_marks (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    subject_id          BIGINT NOT NULL,
    semester_id         BIGINT NOT NULL,
    test_name           VARCHAR(50) NOT NULL,
    marks_obtained      DECIMAL(5,2) NOT NULL,
    max_marks           DECIMAL(5,2) NOT NULL DEFAULT 50.00,
    status              ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'RETURNED') NOT NULL DEFAULT 'DRAFT',
    submitted_by        BIGINT NULL,
    approved_by         BIGINT NULL,
    remarks             VARCHAR(255),
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_marks UNIQUE (student_id, subject_id, test_name),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS exam_results (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    subject_id          BIGINT NOT NULL,
    semester_number     INT NOT NULL CHECK (semester_number BETWEEN 1 AND 6),
    internal_marks      DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    external_marks      DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    total_marks         DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    max_marks           DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    grade               VARCHAR(5),
    grade_points        DECIMAL(4,2) DEFAULT 0.00,
    credits             INT NOT NULL DEFAULT 4,
    result_status       ENUM('PENDING', 'PASS', 'FAIL', 'WITHHELD', 'ABSENT', 'MALPRACTICE') NOT NULL DEFAULT 'PENDING',
    publication_status  ENUM('DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'LOCKED', 'CORRECTED') NOT NULL DEFAULT 'DRAFT',
    published_at        DATETIME NULL,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. NOTIFICATIONS & HELPDESK
CREATE TABLE IF NOT EXISTS notifications (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT NOT NULL,
    title               VARCHAR(200) NOT NULL,
    message             TEXT NOT NULL,
    notification_type   VARCHAR(30) NOT NULL DEFAULT 'GENERAL',
    link                VARCHAR(200),
    is_read             BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS helpdesk_tickets (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    category            VARCHAR(50) NOT NULL,
    subject             VARCHAR(200) NOT NULL,
    description         TEXT NOT NULL,
    priority            ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    status              ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REOPENED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    assigned_to         BIGINT NULL,
    resolution_deadline DATETIME NULL,
    resolved_at         DATETIME NULL,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- SEED DATA
INSERT INTO users (id, name, email, password_hash, role, department) VALUES
(1, 'Administrator', 'admin@bcafly.edu', '$2a$10$7Q9b9K1tHkP4E.V6jG1sYe.N4X8Yq4A.5YhXzQ9yB6Hq.R8q8v7tG', 'ADMIN', 'BCA'),
(2, 'Dr. Anand Sharma', 'hod@bcafly.edu', '$2a$10$7Q9b9K1tHkP4E.V6jG1sYe.N4X8Yq4A.5YhXzQ9yB6Hq.R8q8v7tG', 'HOD', 'BCA'),
(3, 'Prof. Kavitha Rao', 'faculty@bcafly.edu', '$2a$10$7Q9b9K1tHkP4E.V6jG1sYe.N4X8Yq4A.5YhXzQ9yB6Hq.R8q8v7tG', 'FACULTY', 'BCA'),
(4, 'Aakash Singh', 'student@bcafly.edu', '$2a$10$7Q9b9K1tHkP4E.V6jG1sYe.N4X8Yq4A.5YhXzQ9yB6Hq.R8q8v7tG', 'STUDENT', 'BCA')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO academic_years (id, year_label, is_current, start_date, end_date) VALUES
(1, '2026–2027', 1, '2026-08-01', '2027-05-31')
ON DUPLICATE KEY UPDATE is_current=VALUES(is_current);

INSERT INTO semesters (id, academic_year_id, semester_number, start_date, end_date, is_active) VALUES
(1, 1, 1, '2026-08-01', '2026-12-20', 1),
(2, 1, 2, '2027-01-05', '2027-05-20', 1),
(3, 1, 3, '2026-08-01', '2026-12-20', 1),
(4, 1, 4, '2027-01-05', '2027-05-20', 1),
(5, 1, 5, '2026-08-01', '2026-12-20', 1),
(6, 1, 6, '2027-01-05', '2027-05-20', 1)
ON DUPLICATE KEY UPDATE is_active=VALUES(is_active);

INSERT INTO sections (id, semester_id, name) VALUES
(1, 1, 'A'), (2, 1, 'B'),
(3, 3, 'A'), (4, 3, 'B'),
(5, 5, 'A'), (6, 5, 'B')
ON DUPLICATE KEY UPDATE name=VALUES(name);
