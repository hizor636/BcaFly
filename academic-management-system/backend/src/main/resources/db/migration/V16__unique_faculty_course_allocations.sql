-- V16: Ensure Composite Unique Constraint on Faculty Course Assignments

ALTER TABLE faculty_course_assignments
DROP CONSTRAINT IF EXISTS unique_faculty_course_assignment;

ALTER TABLE faculty_course_assignments
ADD CONSTRAINT unique_faculty_course_assignment
UNIQUE (faculty_id, course_id, semester_id, academic_year_id);
