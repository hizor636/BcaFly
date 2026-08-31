-- V11: Semester-Scoped Course Import Schema Updates

-- Drop unique constraint on subjects.code
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_code_key;

-- Add new columns for course configuration
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS academic_year_id VARCHAR(50);
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS course_type VARCHAR(50) DEFAULT 'Core Theory';
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS classroom_or_slot VARCHAR(150) DEFAULT 'Room 301';
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS assigned_faculty_id VARCHAR(50) DEFAULT 'FAC01';
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create composite unique constraint index for courses
CREATE UNIQUE INDEX IF NOT EXISTS unique_course_per_semester
ON subjects (semester_number, academic_year_id, code);

-- Create table for tracking uploaded import files
CREATE TABLE IF NOT EXISTS uploaded_documents (
    id VARCHAR(100) PRIMARY KEY,
    semester_id INT NOT NULL CHECK (semester_id BETWEEN 1 AND 6),
    academic_year_id VARCHAR(50) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('csv', 'xlsx', 'xls')),
    storage_url VARCHAR(500) NOT NULL,
    uploaded_by VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    import_status VARCHAR(20) NOT NULL CHECK (import_status IN ('pending', 'validated', 'imported', 'failed'))
);
