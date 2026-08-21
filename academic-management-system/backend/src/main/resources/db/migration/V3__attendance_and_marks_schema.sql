-- V3: Attendance & Internal Marks
CREATE TABLE attendance_sessions (
    id                  BIGSERIAL PRIMARY KEY,
    faculty_id          BIGINT NOT NULL REFERENCES faculty_profiles(id),
    subject_id          BIGINT NOT NULL REFERENCES subjects(id),
    section_id          BIGINT NOT NULL REFERENCES sections(id),
    semester_id         BIGINT NOT NULL REFERENCES semesters(id),
    session_date        DATE NOT NULL,
    period_number       INT NOT NULL DEFAULT 1,
    topic               VARCHAR(255),
    status              VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'LOCKED')),
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_attendance (
    id              BIGSERIAL PRIMARY KEY,
    session_id      BIGINT NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id      BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    is_present      BOOLEAN NOT NULL DEFAULT TRUE,
    is_od           BOOLEAN NOT NULL DEFAULT FALSE,
    remarks         VARCHAR(255),
    CONSTRAINT uq_session_student UNIQUE (session_id, student_id)
);

CREATE TABLE internal_marks (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    subject_id          BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    semester_id         BIGINT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    test_name           VARCHAR(50) NOT NULL, -- e.g. 'Test 1', 'Test 2', 'Assignment', 'Lab Internal'
    marks_obtained      NUMERIC(5,2) NOT NULL,
    max_marks           NUMERIC(5,2) NOT NULL DEFAULT 50.0,
    status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'RETURNED')),
    submitted_by        BIGINT REFERENCES faculty_profiles(id),
    approved_by         BIGINT REFERENCES users(id),
    remarks             VARCHAR(255),
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_subject_test UNIQUE (student_id, subject_id, test_name)
);

CREATE INDEX idx_att_session ON attendance_sessions(session_date, subject_id, section_id);
CREATE INDEX idx_stu_att ON student_attendance(student_id, is_present);
CREATE INDEX idx_marks_student ON internal_marks(student_id, subject_id, status);
