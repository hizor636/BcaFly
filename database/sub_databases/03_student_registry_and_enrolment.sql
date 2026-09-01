-- ====================================================================
-- SUB-DATABASE 03: Student Master Registry & Semester Enrolment
-- Domain: Student Identity, USN, Cohorts, Sections, Standing & Metrics
-- ====================================================================

-- 1. MASTER STUDENTS
CREATE TABLE IF NOT EXISTS students (
    id          VARCHAR(100) PRIMARY KEY,
    usn         VARCHAR(50) NOT NULL UNIQUE,
    full_name   VARCHAR(150) NOT NULL,
    email       VARCHAR(100),
    phone       VARCHAR(20),
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_students_usn (usn)
) ENGINE=InnoDB COMMENT='Global student identity records';

-- 2. STUDENT PROFILES (JPA / Portal Profile Mappings)
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Extended student academic profile and metrics';

-- 3. SEMESTER NOMINAL ROLLS (Enrolments)
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
    INDEX idx_enrol_sem (semester_id),
    INDEX idx_enrol_standing (standing),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Semester-specific enrolment roster';

-- SAMPLE QUERIES FOR THIS SUB-DATABASE:
-- 1. View all enrolled students in Semester 3 with attendance & SGPA:
-- SELECT usn, section, batch, attendance_percentage, current_sgpa, standing FROM student_enrolments WHERE semester_id = 3 ORDER BY roll_number;
-- 2. Identify students with attendance below 75% (Shortage / Risk):
-- SELECT usn, semester_id, attendance_percentage, current_sgpa FROM student_enrolments WHERE attendance_percentage < 75.00;
-- 3. Count students per semester cohort:
-- SELECT semester_id, COUNT(*) AS enrolled_count, AVG(attendance_percentage) AS avg_att, AVG(current_sgpa) AS avg_gpa FROM student_enrolments GROUP BY semester_id;
