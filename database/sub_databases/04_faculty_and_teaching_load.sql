-- ====================================================================
-- SUB-DATABASE 04: Faculty Profiles & Course Allocations
-- Domain: Teacher Directory, Teaching Loads, Course Assignments
-- ====================================================================

-- 1. FACULTY PROFILES
CREATE TABLE IF NOT EXISTS faculty_profiles (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE,
    employee_code   VARCHAR(50) NOT NULL UNIQUE,
    designation     VARCHAR(100) NOT NULL DEFAULT 'Assistant Professor',
    department      VARCHAR(50) NOT NULL DEFAULT 'BCA',
    phone           VARCHAR(20),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Faculty member profiles and employment details';

-- 2. FACULTY COURSE ALLOCATIONS
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
    UNIQUE KEY uq_fac_sem_course (faculty_id, course_code, semester_id, academic_year_id),
    INDEX idx_fac_alloc_sem (semester_id)
) ENGINE=InnoDB COMMENT='Teaching assignments mapping faculty to courses';

-- SAMPLE QUERIES FOR THIS SUB-DATABASE:
-- 1. View all faculty allocations for Semester 3:
-- SELECT faculty_id, faculty_name, course_code, credits, role FROM faculty_course_assignments WHERE semester_id = 3;
-- 2. Calculate teaching credit load per faculty:
-- SELECT faculty_id, faculty_name, COUNT(course_code) AS total_courses, SUM(credits) AS total_teaching_credits FROM faculty_course_assignments GROUP BY faculty_id, faculty_name;
