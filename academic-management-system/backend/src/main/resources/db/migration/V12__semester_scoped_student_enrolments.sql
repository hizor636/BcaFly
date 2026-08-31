-- V12: Semester-Scoped Student Enrolments Schema

CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(100) PRIMARY KEY,
    usn VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_enrolments (
    id VARCHAR(100) PRIMARY KEY,
    student_id VARCHAR(100) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    usn VARCHAR(50) NOT NULL,
    semester_id INT NOT NULL CHECK (semester_id BETWEEN 1 AND 6),
    academic_year_id VARCHAR(50) NOT NULL,
    section VARCHAR(1) CHECK (section IN ('A', 'B', 'C')),
    batch VARCHAR(50) NOT NULL,
    roll_number INT,
    enrolment_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (enrolment_status IN ('ACTIVE', 'DROPPED', 'COMPLETED')),
    attendance_percentage NUMERIC(5,2),
    current_sgpa NUMERIC(4,2),
    standing VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (standing IN ('PASS', 'FAIL', 'ATKT', 'PENDING')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_student_semester_enrolment
ON student_enrolments (student_id, semester_id, academic_year_id);

CREATE UNIQUE INDEX IF NOT EXISTS unique_usn_per_semester
ON student_enrolments (usn, semester_id, academic_year_id);
