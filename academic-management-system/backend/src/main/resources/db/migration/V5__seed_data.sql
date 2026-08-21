-- V5: Seed Data for BcaFly BCA Department
-- Password for all seed users is 'Password@123' (BCrypt: $2a$10$wE1V2vDkY6U21GvXf9vV6.z33m13f41R5k74dG/q7yZlPzZ1z52bW or similar)
-- Using standard BCrypt hash for 'Password@123'
INSERT INTO users (id, name, email, password_hash, role, department, is_active) VALUES
(100, 'Dr. B. K. Sharma', 'admin@bcafly.edu', '$2a$10$8ocB2KPCyTwojVhvrAXyt.96xb77QBsKvky.uq69UIeM/x/IENp6K', 'ADMIN', 'BCA', true),
(101, 'Dr. Ananya Rao', 'hod@bcafly.edu', '$2a$10$8ocB2KPCyTwojVhvrAXyt.96xb77QBsKvky.uq69UIeM/x/IENp6K', 'HOD', 'BCA', true),
(102, 'Prof. Rahul Nair', 'rahul@bcafly.edu', '$2a$10$8ocB2KPCyTwojVhvrAXyt.96xb77QBsKvky.uq69UIeM/x/IENp6K', 'FACULTY', 'BCA', true),
(103, 'Ms. Kavya Suresh', 'kavya@bcafly.edu', '$2a$10$8ocB2KPCyTwojVhvrAXyt.96xb77QBsKvky.uq69UIeM/x/IENp6K', 'FACULTY', 'BCA', true),
(104, 'Aakash Singh', 'aakash@bcafly.edu', '$2a$10$8ocB2KPCyTwojVhvrAXyt.96xb77QBsKvky.uq69UIeM/x/IENp6K', 'STUDENT', 'BCA', true),
(105, 'Bhavana M', 'bhavana@bcafly.edu', '$2a$10$8ocB2KPCyTwojVhvrAXyt.96xb77QBsKvky.uq69UIeM/x/IENp6K', 'STUDENT', 'BCA', true),
(106, 'Chetan Kumar', 'chetan@bcafly.edu', '$2a$10$8ocB2KPCyTwojVhvrAXyt.96xb77QBsKvky.uq69UIeM/x/IENp6K', 'STUDENT', 'BCA', true)
ON CONFLICT (email) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

INSERT INTO academic_years (id, year_label, is_current, start_date, end_date) VALUES
(1, '2026–2027', true, '2026-08-01', '2027-05-31')
ON CONFLICT (id) DO NOTHING;

INSERT INTO semesters (id, academic_year_id, semester_number, start_date, end_date, is_active) VALUES
(1, 1, 1, '2026-08-01', '2026-12-31', true),
(2, 1, 2, '2027-01-01', '2027-05-31', false),
(3, 1, 3, '2026-08-01', '2026-12-31', true),
(4, 1, 4, '2027-01-01', '2027-05-31', false),
(5, 1, 5, '2026-08-01', '2026-12-31', true),
(6, 1, 6, '2027-01-01', '2027-05-31', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sections (id, semester_id, name) VALUES
(1, 1, 'A'),
(2, 1, 'B'),
(3, 3, 'A'),
(4, 3, 'B'),
(5, 5, 'A'),
(6, 5, 'B')
ON CONFLICT (id) DO NOTHING;

INSERT INTO subjects (id, code, title, credits, semester_number, max_internal_marks, pass_internal_marks) VALUES
(1, 'BCA101', 'Problem Solving & C Programming', 4, 1, 50, 20),
(2, 'BCA102', 'Discrete Mathematics', 4, 1, 50, 20),
(3, 'BCA301', 'Data Structures & Algorithms', 4, 3, 50, 20),
(4, 'BCA302', 'Database Management Systems', 4, 3, 50, 20),
(5, 'BCA501', 'Web Technologies & Frameworks', 4, 5, 50, 20),
(6, 'BCA502', 'Software Engineering & Cloud Computing', 4, 5, 50, 20)
ON CONFLICT (id) DO NOTHING;

INSERT INTO faculty_profiles (id, user_id, employee_code, designation, department, phone) VALUES
(1, 102, 'FAC-001', 'Assistant Professor', 'BCA', '+91 9876543210'),
(2, 103, 'FAC-002', 'Associate Professor', 'BCA', '+91 9876543211')
ON CONFLICT (id) DO NOTHING;

INSERT INTO student_profiles (id, user_id, reg_no, roll_no, current_semester_id, section_id, mentor_id, cgpa, attendance_pct, risk_status) VALUES
(1, 104, 'BCA26001', '26BCA01', 3, 3, 1, 7.15, 72.0, 'MEDIUM'),
(2, 105, 'BCA26002', '26BCA02', 3, 3, 1, 8.90, 91.5, 'LOW'),
(3, 106, 'BCA26003', '26BCA03', 5, 5, 2, 6.40, 68.0, 'HIGH')
ON CONFLICT (id) DO NOTHING;

INSERT INTO faculty_assignments (id, faculty_id, subject_id, section_id, semester_id, academic_year_id) VALUES
(1, 1, 3, 3, 3, 1),
(2, 1, 4, 3, 3, 1),
(3, 2, 5, 5, 5, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO event_categories (id, name, description) VALUES
(1, 'Workshop', 'Technical and practical hands-on workshops'),
(2, 'Hackathon', 'Coding and innovation competitions'),
(3, 'Certification', 'Industry and online certifications (AWS, Google, Coursera)'),
(4, 'Seminar', 'Academic guest lectures and webinars'),
(5, 'Club Activity', 'Department tech club and cultural events')
ON CONFLICT (id) DO NOTHING;

INSERT INTO announcements (id, title, content, category, target_role, target_semester, created_by, publish_date) VALUES
(1, 'Internal Assessment Review Meeting', 'All Semester 3 and 5 students with attendance below 75% must meet their assigned faculty mentor before Friday.', 'Attendance Warning', 'STUDENT', 3, 101, CURRENT_DATE),
(2, 'Department Hackathon 2026', 'Registrations are open for the annual BCA Hackathon on Web & AI Innovation. Team size 2-4.', 'Hackathon / Workshop', 'ALL', NULL, 101, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;
