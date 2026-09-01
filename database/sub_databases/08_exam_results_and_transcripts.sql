-- ====================================================================
-- SUB-DATABASE 08: End-Semester Exam Results & Academic Transcripts
-- Domain: University Exams, Grades (O, A+, A, B+, B, C, P, F), SGPA, CGPA
-- ====================================================================

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
    INDEX idx_res_student (student_id),
    INDEX idx_res_sem (semester_number),
    INDEX idx_res_status (result_status),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Official end-semester university examination results';

-- SAMPLE QUERIES FOR THIS SUB-DATABASE:
-- 1. View official grade card for a student in Semester 3:
-- SELECT sub.code, sub.title, er.internal_marks, er.external_marks, er.total_marks, er.grade, er.grade_points, er.credits, er.result_status FROM exam_results er JOIN subjects sub ON er.subject_id = sub.id WHERE er.student_id = 1 AND er.semester_number = 3;
-- 2. Find all students with backlogs (Fail status) in Semester 3:
-- SELECT sp.reg_no, sub.code, sub.title, er.total_marks, er.grade FROM exam_results er JOIN student_profiles sp ON er.student_id = sp.id JOIN subjects sub ON er.subject_id = sub.id WHERE er.semester_number = 3 AND er.result_status = 'FAIL';
