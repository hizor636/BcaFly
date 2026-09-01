-- ====================================================================
-- SUB-DATABASE 09: Student Portfolio, Activities & On-Duty (OD)
-- Domain: Hackathons, Certifications, Extracurricular Points, OD Passes
-- ====================================================================

-- 1. EVENT CATEGORIES
CREATE TABLE IF NOT EXISTS event_categories (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    points_weight   INT NOT NULL DEFAULT 10
) ENGINE=InnoDB COMMENT='Activity types (Technical, Sports, Cultural, Leadership)';

-- 2. STUDENT EVENT SUBMISSIONS
CREATE TABLE IF NOT EXISTS student_event_submissions (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    category_id     BIGINT NOT NULL,
    event_name      VARCHAR(200) NOT NULL,
    organizer       VARCHAR(200) NOT NULL,
    event_date      DATE NOT NULL,
    certificate_url VARCHAR(500),
    status          ENUM('PENDING', 'VERIFIED_FACULTY', 'APPROVED_HOD', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    points_awarded  INT DEFAULT 0,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES event_categories(id)
) ENGINE=InnoDB COMMENT='Student extracurricular participation submissions';

-- 3. ON-DUTY (OD) ATTENDANCE REQUESTS
CREATE TABLE IF NOT EXISTS od_requests (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    event_submission_id BIGINT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    reason              TEXT NOT NULL,
    status              ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    approved_by         BIGINT NULL,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (event_submission_id) REFERENCES student_event_submissions(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Formal On-Duty attendance waiver requests';

-- SAMPLE QUERIES FOR THIS SUB-DATABASE:
-- 1. View all pending activity submissions awaiting faculty verification:
-- SELECT ses.id, sp.reg_no, ses.event_name, ses.organizer, ses.event_date FROM student_event_submissions ses JOIN student_profiles sp ON ses.student_id = sp.id WHERE ses.status = 'PENDING';
