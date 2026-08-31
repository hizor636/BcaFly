-- V13: Semester-Scoped Faculty Course Assignments Schema

CREATE TABLE IF NOT EXISTS faculty_members (
    id VARCHAR(100) PRIMARY KEY,
    faculty_code VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    designation VARCHAR(100) NOT NULL DEFAULT 'Assistant Professor',
    department VARCHAR(50) NOT NULL DEFAULT 'BCA',
    email VARCHAR(100),
    phone VARCHAR(20),
    employment_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (employment_status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faculty_course_assignments (
    id VARCHAR(100) PRIMARY KEY,
    faculty_id VARCHAR(100) NOT NULL REFERENCES faculty_members(id) ON DELETE CASCADE,
    course_id VARCHAR(100) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    semester_id INT NOT NULL CHECK (semester_id BETWEEN 1 AND 6),
    academic_year_id VARCHAR(50) NOT NULL,
    weekly_teaching_credits INT NOT NULL DEFAULT 4,
    assigned_role VARCHAR(30) NOT NULL DEFAULT 'PRIMARY' CHECK (assigned_role IN ('PRIMARY', 'CO_FACULTY', 'LAB_INCHARGE')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REMOVED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_faculty_course_assignment
ON faculty_course_assignments (faculty_id, course_id, semester_id, academic_year_id);
