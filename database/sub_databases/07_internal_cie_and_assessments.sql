-- ====================================================================
-- SUB-DATABASE 07: Continuous Internal Evaluation (CIE) & Marks
-- Domain: CIA-1, CIA-2, Lab Experiments, Component Scores (Max 50)
-- ====================================================================

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
    INDEX idx_marks_student (student_id),
    INDEX idx_marks_subject (subject_id),
    INDEX idx_marks_status (status),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Continuous internal evaluation (CIE) assessment marks';

-- SAMPLE QUERIES FOR THIS SUB-DATABASE:
-- 1. View all CIE marks for a specific student:
-- SELECT sub.code, sub.title, im.test_name, im.marks_obtained, im.max_marks, im.status FROM internal_marks im JOIN subjects sub ON im.subject_id = sub.id WHERE im.student_id = 1;
-- 2. View marks needing HOD review/approval:
-- SELECT im.id, sub.code, im.test_name, COUNT(im.student_id) AS student_count FROM internal_marks im JOIN subjects sub ON im.subject_id = sub.id WHERE im.status = 'SUBMITTED' GROUP BY im.id, sub.code, im.test_name;
