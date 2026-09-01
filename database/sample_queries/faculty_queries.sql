-- ====================================================================
-- BcaFly SQL Queries: Faculty Teaching & Attendance Operations
-- Role: FACULTY
-- ====================================================================

-- 1. View course nominal roster for a faculty's assigned subject in Semester 3
SELECT 
    se.roll_number,
    se.usn,
    s.full_name,
    se.section,
    se.attendance_percentage,
    se.current_sgpa
FROM student_enrolments se
JOIN students s ON se.student_id = s.id
WHERE se.semester_id = 3 AND se.enrolment_status = 'ACTIVE'
ORDER BY se.roll_number ASC;

-- 2. View recent attendance sessions marked by faculty
SELECT 
    ats.id AS session_id,
    ats.session_date,
    ats.period_number,
    sub.code AS subject_code,
    sub.title AS subject_title,
    ats.topic,
    COUNT(sa.id) AS total_marked_students,
    SUM(CASE WHEN sa.is_present = 1 THEN 1 ELSE 0 END) AS present_count,
    SUM(CASE WHEN sa.is_od = 1 THEN 1 ELSE 0 END) AS od_count,
    SUM(CASE WHEN sa.is_present = 0 AND sa.is_od = 0 THEN 1 ELSE 0 END) AS absent_count
FROM attendance_sessions ats
JOIN subjects sub ON ats.subject_id = sub.id
LEFT JOIN student_attendance sa ON ats.id = sa.session_id
WHERE ats.semester_id = 3
GROUP BY ats.id, ats.session_date, ats.period_number, sub.code, sub.title, ats.topic
ORDER BY ats.session_date DESC;

-- 3. Enter/Update CIA Internal Marks for a student
INSERT INTO internal_marks (student_id, subject_id, semester_id, test_name, marks_obtained, max_marks, status, remarks)
VALUES (1, 1, 3, 'CIA-1', 42.50, 50.00, 'SUBMITTED', 'Excellent problem solving')
ON DUPLICATE KEY UPDATE marks_obtained = VALUES(marks_obtained), status = VALUES(status), remarks = VALUES(remarks);
