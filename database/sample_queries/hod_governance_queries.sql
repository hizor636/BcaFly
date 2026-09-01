-- ====================================================================
-- BcaFly SQL Queries: Head of Department (HOD) Governance
-- Role: HOD
-- ====================================================================

-- 1. Students at Risk (Attendance Shortage < 75% OR Academic Standing = FAIL)
SELECT 
    se.usn,
    s.full_name,
    se.semester_id,
    se.section,
    se.attendance_percentage,
    se.current_sgpa,
    se.standing,
    CASE 
        WHEN se.attendance_percentage < 75 AND se.current_sgpa < 5.0 THEN 'CRITICAL INTERVENTION REQUIRED'
        WHEN se.attendance_percentage < 75 THEN 'ATTENDANCE SHORTAGE'
        WHEN se.current_sgpa < 5.0 THEN 'ACADEMIC RISK'
        ELSE 'MONITOR'
    END AS risk_category
FROM student_enrolments se
JOIN students s ON se.student_id = s.id
WHERE se.attendance_percentage < 75.00 OR se.current_sgpa < 5.00 OR se.standing = 'FAIL'
ORDER BY se.semester_id, se.attendance_percentage ASC;

-- 2. Faculty Teaching Load & Distribution
SELECT 
    fca.faculty_id,
    fca.faculty_name,
    COUNT(DISTINCT fca.course_code) AS assigned_courses_count,
    SUM(fca.credits) AS total_weekly_teaching_credits,
    GROUP_CONCAT(DISTINCT fca.course_code ORDER BY fca.course_code SEPARATOR ', ') AS courses_list
FROM faculty_course_assignments fca
GROUP BY fca.faculty_id, fca.faculty_name
ORDER BY total_weekly_teaching_credits DESC;

-- 3. Internal Marks Pending HOD Review & Publication Approval
SELECT 
    sub.semester_number AS semester,
    sub.code AS course_code,
    sub.title AS course_title,
    im.test_name,
    COUNT(im.id) AS total_evaluated_records,
    ROUND(AVG(im.marks_obtained), 2) AS class_average_score,
    MAX(im.marks_obtained) AS highest_score,
    MIN(im.marks_obtained) AS lowest_score
FROM internal_marks im
JOIN subjects sub ON im.subject_id = sub.id
WHERE im.status = 'SUBMITTED'
GROUP BY sub.semester_number, sub.code, sub.title, im.test_name;
