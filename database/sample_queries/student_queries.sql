-- ====================================================================
-- BcaFly SQL Queries: Student Portal Queries
-- Role: STUDENT
-- ====================================================================

-- 1. Student weekly timetable schedule (Monday to Friday)
SELECT 
    day_of_week,
    period_number,
    start_time,
    end_time,
    course_code,
    course_title,
    room_code,
    faculty_name,
    session_type
FROM timetable_entries
WHERE semester_id = 3
ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'), period_number;

-- 2. Student attendance summary & percentage by subject
SELECT 
    sub.code AS subject_code,
    sub.title AS subject_title,
    COUNT(sa.id) AS total_conducted_classes,
    SUM(CASE WHEN sa.is_present = 1 OR sa.is_od = 1 THEN 1 ELSE 0 END) AS attended_classes,
    ROUND((SUM(CASE WHEN sa.is_present = 1 OR sa.is_od = 1 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(sa.id), 0)), 2) AS attendance_percentage
FROM subjects sub
LEFT JOIN attendance_sessions ats ON sub.id = ats.subject_id
LEFT JOIN student_attendance sa ON ats.id = sa.session_id AND sa.student_id = 1
WHERE sub.semester_number = 3
GROUP BY sub.code, sub.title;

-- 3. Student semester grade card & transcript
SELECT 
    sub.code AS course_code,
    sub.title AS course_title,
    sub.credits,
    er.internal_marks,
    er.external_marks,
    er.total_marks,
    er.grade,
    er.grade_points,
    er.result_status
FROM exam_results er
JOIN subjects sub ON er.subject_id = sub.id
WHERE er.student_id = 1 AND er.semester_number = 3;
