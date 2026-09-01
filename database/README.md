# 🗄️ BcaFly Database Architecture & Modular Query Directory

Welcome to the **BcaFly Modular Database Architecture**. The database system is organized into clean, domain-specific sub-databases and query files so you can easily understand, navigate, and query every part of the academic management system.

---

## 📂 Directory Structure

```
database/
├── README.md                                # This Guide & Complete Catalog
├── 00_master_schema_mysql.sql               # Complete single-run MySQL setup (Port 3306)
├── 00_master_schema_postgres.sql            # Complete single-run PostgreSQL setup (Port 5432)
├── sub_databases/                           # Domain Sub-Databases
│   ├── 01_auth_users_and_audit.sql          # Users, Roles (RBAC), Audit Trail
│   ├── 02_academic_curriculum_and_terms.sql # Academic Years, Semesters 1–6, Subjects/Courses
│   ├── 03_student_registry_and_enrolment.sql# Students, Profiles, Semester Nominal Rolls
│   ├── 04_faculty_and_teaching_load.sql     # Faculty Profiles, Course Allocations
│   ├── 05_timetable_and_classrooms.sql      # Weekly Timetable Schedule, Period Slots
│   ├── 06_attendance_and_session_logs.sql   # Attendance Registers, Student Presence Logs
│   ├── 07_internal_cie_and_assessments.sql  # CIA Tests, Assignments, Internal Marks
│   ├── 08_exam_results_and_transcripts.sql  # End-Sem Exam Results, Grades, SGPA, CGPA
│   ├── 09_portfolio_and_activities.sql      # Co-Curricular, Certifications, OD Requests
│   └── 10_helpdesk_and_notifications.sql    # Support Tickets, Notifications
└── sample_queries/                          # Ready-to-Run Query Snippets by User Role
    ├── admin_queries.sql                    # Workspace stats, bulk enrolments, audit logs
    ├── hod_governance_queries.sql           # Backlog monitoring, faculty load, risk alerts
    ├── faculty_queries.sql                  # Attendance marking, marks submission, course roster
    └── student_queries.sql                  # Timetable lookup, attendance %, semester transcript
```

---

## 🧭 Sub-Database Domain Index

| Domain # | Sub-Database File | Key Tables | Purpose |
| :---: | :--- | :--- | :--- |
| **01** | [`01_auth_users_and_audit.sql`](file:///c:/Users/DELL/Desktop/New%20folder/database/sub_databases/01_auth_users_and_audit.sql) | `users`, `audit_logs` | Authentication, RBAC (ADMIN, HOD, FACULTY, STUDENT), Immutable audit logging |
| **02** | [`02_academic_curriculum_and_terms.sql`](file:///c:/Users/DELL/Desktop/New%20folder/database/sub_databases/02_academic_curriculum_and_terms.sql) | `academic_years`, `semesters`, `sections`, `subjects` | CBCS BCA 6-semester curriculum, course codes, credits, term boundaries |
| **03** | [`03_student_registry_and_enrolment.sql`](file:///c:/Users/DELL/Desktop/New%20folder/database/sub_databases/03_student_registry_and_enrolment.sql) | `students`, `student_profiles`, `student_enrolments` | Student master registry, semester enrolments, batches, sections, attendance stats |
| **04** | [`04_faculty_and_teaching_load.sql`](file:///c:/Users/DELL/Desktop/New%20folder/database/sub_databases/04_faculty_and_teaching_load.sql) | `faculty_profiles`, `faculty_course_assignments` | Faculty directory, employee IDs, course-to-teacher mappings, credit loads |
| **05** | [`05_timetable_and_classrooms.sql`](file:///c:/Users/DELL/Desktop/New%20folder/database/sub_databases/05_timetable_and_classrooms.sql) | `timetable_entries`, `classroom_slots` | Mon–Fri weekly class schedule, period numbers (1–8), room allocations |
| **06** | [`06_attendance_and_session_logs.sql`](file:///c:/Users/DELL/Desktop/New%20folder/database/sub_databases/06_attendance_and_session_logs.sql) | `attendance_sessions`, `student_attendance` | Hourly lecture sessions, student present/absent/OD records, topics covered |
| **07** | [`07_internal_cie_and_assessments.sql`](file:///c:/Users/DELL/Desktop/New%20folder/database/sub_databases/07_internal_cie_and_assessments.sql) | `internal_marks`, `assessment_components` | CIA-1, CIA-2, lab assignments, max marks (50), approval status |
| **08** | [`08_exam_results_and_transcripts.sql`](file:///c:/Users/DELL/Desktop/New%20folder/database/sub_databases/08_exam_results_and_transcripts.sql) | `exam_results`, `semester_transcripts` | Semester end examination marks (100), letter grades, grade points, pass/fail status |
| **09** | [`09_portfolio_and_activities.sql`](file:///c:/Users/DELL/Desktop/New%20folder/database/sub_databases/09_portfolio_and_activities.sql) | `event_categories`, `student_event_submissions`, `od_requests` | Hackathons, workshops, extracurricular points, On-Duty attendance approvals |
| **10** | [`10_helpdesk_and_notifications.sql`](file:///c:/Users/DELL/Desktop/New%20folder/database/sub_databases/10_helpdesk_and_notifications.sql) | `helpdesk_tickets`, `notifications`, `document_requests` | Support requests, broadcast announcements, transcript/bonafide document orders |

---

## 🚀 How to Use in Your Database Client

1. **Connect to MySQL or PostgreSQL**:
   - MySQL: Host `localhost`, Port `3306`, User `root`, Database `bcafly_db`
   - PostgreSQL: Host `localhost`, Port `5432`, User `postgres` or `bcafly_app`, Database `bcafly_db`
2. **Execute Full Setup**: Open `00_master_schema_mysql.sql` (or `postgres.sql`) and run it.
3. **Execute Domain-Specific Queries**: Navigate to `sub_databases/` or `sample_queries/` to view and run isolated queries for any specific academic module.
