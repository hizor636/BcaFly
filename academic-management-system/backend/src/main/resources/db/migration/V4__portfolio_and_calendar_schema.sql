-- V4: Portfolio, Academic Calendar & Department Management
CREATE TABLE academic_calendar (
    id              BIGSERIAL PRIMARY KEY,
    semester_id     BIGINT REFERENCES semesters(id) ON DELETE CASCADE,
    event_date      DATE NOT NULL,
    day_type        VARCHAR(30) NOT NULL CHECK (day_type IN ('WORKING_DAY', 'WEEKEND', 'PUBLIC_HOLIDAY', 'COLLEGE_HOLIDAY', 'EXAM_DAY', 'VACATION', 'SPECIAL_WORKING_DAY')),
    title           VARCHAR(150) NOT NULL,
    description     TEXT,
    is_working_day  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE event_categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE student_event_submissions (
    id                      BIGSERIAL PRIMARY KEY,
    submission_code         VARCHAR(50) NOT NULL UNIQUE,
    student_id              BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    semester_id             BIGINT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    event_name              VARCHAR(200) NOT NULL,
    category_id             BIGINT REFERENCES event_categories(id),
    organizer               VARCHAR(150) NOT NULL,
    start_date              DATE NOT NULL,
    end_date                DATE NOT NULL,
    mode                    VARCHAR(20) NOT NULL DEFAULT 'OFFLINE' CHECK (mode IN ('ONLINE', 'OFFLINE', 'HYBRID')),
    venue_or_url            VARCHAR(255),
    description             TEXT,
    skills_summary          VARCHAR(255),
    working_day_status      VARCHAR(30) DEFAULT 'WORKING_DAY',
    verification_status     VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED' CHECK (verification_status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'NEEDS_PROOF', 'REJECTED')),
    faculty_remarks         TEXT,
    hod_remarks             TEXT,
    verified_by             BIGINT REFERENCES faculty_profiles(id),
    verified_at             TIMESTAMP,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_proofs (
    id              BIGSERIAL PRIMARY KEY,
    submission_id   BIGINT NOT NULL REFERENCES student_event_submissions(id) ON DELETE CASCADE,
    file_name       VARCHAR(255) NOT NULL,
    file_path       VARCHAR(500) NOT NULL,
    file_type       VARCHAR(50),
    file_size       BIGINT,
    uploaded_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE od_requests (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    submission_id   BIGINT NOT NULL REFERENCES student_event_submissions(id) ON DELETE CASCADE,
    requested_date  DATE NOT NULL,
    reason          TEXT NOT NULL,
    faculty_status  VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (faculty_status IN ('PENDING', 'RECOMMENDED', 'REJECTED')),
    hod_status      VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (hod_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approval_notes  TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE announcements (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    content         TEXT NOT NULL,
    category        VARCHAR(50) DEFAULT 'Academic Notice',
    target_role     VARCHAR(20) DEFAULT 'ALL',
    target_semester INT,
    created_by      BIGINT REFERENCES users(id),
    publish_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date     DATE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cal_date ON academic_calendar(event_date);
CREATE INDEX idx_sub_student ON student_event_submissions(student_id, verification_status);
CREATE INDEX idx_od_student ON od_requests(student_id, hod_status);
