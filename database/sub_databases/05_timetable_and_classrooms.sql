-- ====================================================================
-- SUB-DATABASE 05: Weekly Timetable & Classrooms Matrix
-- Domain: Period Slots (1–8), Mon–Fri Schedule, Rooms, Labs
-- ====================================================================

CREATE TABLE IF NOT EXISTS timetable_entries (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    semester_id         INT NOT NULL CHECK (semester_id BETWEEN 1 AND 6),
    academic_year_id    VARCHAR(50) DEFAULT '2026-27-ODD',
    day_of_week         ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    period_number       INT NOT NULL CHECK (period_number BETWEEN 1 AND 8),
    course_code         VARCHAR(50) NOT NULL,
    course_title        VARCHAR(150),
    faculty_id          VARCHAR(50) NOT NULL,
    faculty_name        VARCHAR(150),
    room_code           VARCHAR(50) DEFAULT 'Room 301',
    start_time          TIME DEFAULT '09:00:00',
    end_time            TIME DEFAULT '09:55:00',
    session_type        VARCHAR(50) DEFAULT 'Lecture',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_sem_day_period (semester_id, academic_year_id, day_of_week, period_number),
    INDEX idx_tt_sem (semester_id)
) ENGINE=InnoDB COMMENT='Weekly period slots schedule matrix per semester';

-- SAMPLE QUERIES FOR THIS SUB-DATABASE:
-- 1. View full weekly schedule for Semester 3:
-- SELECT day_of_week, period_number, course_code, faculty_name, room_code, start_time, end_time FROM timetable_entries WHERE semester_id = 3 ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'), period_number;
-- 2. Check room utilization (find all classes in Room 301):
-- SELECT semester_id, day_of_week, period_number, course_code, faculty_name FROM timetable_entries WHERE room_code = 'Room 301';
