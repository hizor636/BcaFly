-- ====================================================================
-- SUB-DATABASE 02: Academic Curriculum, Terms & Course Catalog
-- Domain: CBCS BCA Semesters (1–6), Course Modules, Credits, Syllabus
-- ====================================================================

-- 1. ACADEMIC YEARS
CREATE TABLE IF NOT EXISTS academic_years (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    year_label  VARCHAR(20) NOT NULL UNIQUE,
    is_current  BOOLEAN NOT NULL DEFAULT FALSE,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL
) ENGINE=InnoDB COMMENT='Academic terms and calendar cycles';

-- 2. SEMESTERS (Semesters 1 through 6)
CREATE TABLE IF NOT EXISTS semesters (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    academic_year_id    BIGINT NOT NULL,
    semester_number     INT NOT NULL CHECK (semester_number BETWEEN 1 AND 8),
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Semester workspaces (1–6) mapped to academic year';

-- 3. SECTIONS
CREATE TABLE IF NOT EXISTS sections (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    semester_id     BIGINT NOT NULL,
    name            VARCHAR(10) NOT NULL,
    CONSTRAINT uq_sem_sec UNIQUE (semester_id, name),
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Classroom sections per semester (e.g. Section A, Section B)';

-- 4. SUBJECTS / COURSE CATALOG
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
    UNIQUE KEY uq_sub_sem (semester_number, academic_year_id, code),
    INDEX idx_subjects_sem (semester_number),
    INDEX idx_subjects_code (code)
) ENGINE=InnoDB COMMENT='Course curriculum catalog across all 6 semesters';

-- SEED CURRICULUM DATA
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

-- SAMPLE QUERIES FOR THIS SUB-DATABASE:
-- 1. Get all courses configured for Semester 3:
-- SELECT code, title, credits, course_type, classroom_or_slot, assigned_faculty_id FROM subjects WHERE semester_number = 3 AND is_active = TRUE;
-- 2. Count total courses and credits per semester:
-- SELECT semester_number, COUNT(*) AS total_courses, SUM(credits) AS total_credits FROM subjects GROUP BY semester_number ORDER BY semester_number;
