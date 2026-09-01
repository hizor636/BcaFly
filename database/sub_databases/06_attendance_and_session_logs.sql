-- ====================================================================
-- SUB-DATABASE 06: Attendance Registers & Daily Session Logs
-- Domain: Lecture Logs, Student Attendance (Present/Absent/OD)
-- ====================================================================

-- 1. ATTENDANCE SESSIONS
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    faculty_id          BIGINT NOT NULL,
    subject_id          BIGINT NOT NULL,
    section_id          BIGINT NOT NULL,
    semester_id         BIGINT NOT NULL,
    session_date        DATE NOT NULL,
    period_number       INT NOT NULL DEFAULT 1,
    topic               VARCHAR(255),
    status              ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'LOCKED') NOT NULL DEFAULT 'SUBMITTED',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_att_sess_date (session_date),
    INDEX idx_att_sess_sem (semester_id),
    FOREIGN KEY (faculty_id) REFERENCES faculty_profiles(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (section_id) REFERENCES sections(id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
) ENGINE=InnoDB COMMENT='Hourly lecture attendance sessions conducted by faculty';

-- 2. STUDENT ATTENDANCE RECORDS
CREATE TABLE IF NOT EXISTS student_attendance (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id      BIGINT NOT NULL,
    student_id      BIGINT NOT NULL,
    is_present      BOOLEAN NOT NULL DEFAULT TRUE,
    is_od           BOOLEAN NOT NULL DEFAULT FALSE,
    remarks         VARCHAR(255),
    CONSTRAINT uq_session_student UNIQUE (session_id, student_id),
    INDEX idx_stu_att_status (is_present),
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Individual student presence or on-duty records';

-- SAMPLE QUERIES FOR THIS SUB-DATABASE:
-- 1. View attendance log for a specific session:
-- SELECT sa.id, sp.reg_no, sa.is_present, sa.is_od, sa.remarks FROM student_attendance sa JOIN student_profiles sp ON sa.student_id = sp.id WHERE sa.session_id = 1;
-- 2. Calculate percentage of sessions attended by a student:
-- SELECT sp.reg_no, COUNT(*) AS total_sessions, SUM(CASE WHEN sa.is_present = 1 OR sa.is_od = 1 THEN 1 ELSE 0 END) AS attended_sessions, ROUND((SUM(CASE WHEN sa.is_present = 1 OR sa.is_od = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) AS calculated_pct FROM student_attendance sa JOIN student_profiles sp ON sa.student_id = sp.id GROUP BY sp.reg_no;
