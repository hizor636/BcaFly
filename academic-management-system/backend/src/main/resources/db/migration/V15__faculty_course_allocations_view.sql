-- V15: Faculty Course Allocations View

CREATE OR REPLACE VIEW faculty_course_allocations AS
SELECT 
    id,
    faculty_id,
    course_id,
    course_code,
    semester_id,
    academic_year_id,
    weekly_teaching_credits AS teaching_load,
    (assigned_role = 'LAB_INCHARGE') AS is_lab_incharge,
    assigned_role,
    status,
    created_at,
    updated_at
FROM faculty_course_assignments;
