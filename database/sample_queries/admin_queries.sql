-- ====================================================================
-- BcaFly SQL Queries: Administrator Operations
-- Role: ADMIN
-- ====================================================================

-- 1. Get total enrolled students across all 6 BCA Semesters
SELECT 
    semester_id AS semester,
    COUNT(*) AS total_students,
    COUNT(CASE WHEN standing = 'PASS' THEN 1 END) AS active_good_standing,
    COUNT(CASE WHEN standing = 'FAIL' OR attendance_percentage < 75 THEN 1 END) AS at_risk_count,
    ROUND(AVG(attendance_percentage), 2) AS avg_attendance_pct,
    ROUND(AVG(current_sgpa), 2) AS avg_sgpa
FROM student_enrolments
GROUP BY semester_id
ORDER BY semester_id;

-- 2. View all active course modules and assigned faculty in a semester
SELECT 
    sub.code AS course_code,
    sub.title AS course_title,
    sub.credits,
    sub.course_type,
    sub.classroom_or_slot,
    fca.faculty_name,
    fca.role AS faculty_role
FROM subjects sub
LEFT JOIN faculty_course_assignments fca 
    ON sub.code = fca.course_code AND sub.semester_number = fca.semester_id
WHERE sub.semester_number = 3 AND sub.is_active = TRUE
ORDER BY sub.code;

-- 3. Audit trail: View recent administrative changes
SELECT 
    al.id,
    al.created_at,
    u.name AS actor_name,
    u.role AS actor_role,
    al.action,
    al.details
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 25;

-- 4. Enrol a new student into Semester 3 (Direct SQL Insertion)
INSERT INTO students (id, usn, full_name, email, phone)
VALUES ('stu-s3-101', '1BC24099', 'Suresh Raina', 'suresh.raina@bcafly.edu', '+91 98765 99999')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT INTO student_enrolments (id, student_id, usn, semester_id, academic_year_id, section, batch, roll_number, enrolment_status, attendance_percentage, current_sgpa, standing)
VALUES ('enrol-s3-101', 'stu-s3-101', '1BC24099', 3, '2026-27-ODD', 'A', '2024–2027', 99, 'ACTIVE', 91.50, 8.75, 'PASS')
ON DUPLICATE KEY UPDATE current_sgpa = VALUES(current_sgpa);
