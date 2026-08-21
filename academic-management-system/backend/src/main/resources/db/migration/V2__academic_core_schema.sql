-- V2: Academic Core Tables
CREATE TABLE academic_years (
    id          BIGSERIAL PRIMARY KEY,
    year_label  VARCHAR(20) NOT NULL UNIQUE,
    is_current  BOOLEAN NOT NULL DEFAULT FALSE,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL
);

CREATE TABLE semesters (
    id                  BIGSERIAL PRIMARY KEY,
    academic_year_id    BIGINT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    semester_number     INT NOT NULL CHECK (semester_number BETWEEN 1 AND 8),
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE sections (
    id              BIGSERIAL PRIMARY KEY,
    semester_id     BIGINT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    name            VARCHAR(10) NOT NULL,
    CONSTRAINT uq_sem_sec UNIQUE (semester_id, name)
);

CREATE TABLE subjects (
    id                  BIGSERIAL PRIMARY KEY,
    code                VARCHAR(20) NOT NULL UNIQUE,
    title               VARCHAR(150) NOT NULL,
    credits             INT NOT NULL DEFAULT 4,
    semester_number     INT NOT NULL CHECK (semester_number BETWEEN 1 AND 8),
    max_internal_marks  INT NOT NULL DEFAULT 50,
    pass_internal_marks INT NOT NULL DEFAULT 20,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE faculty_profiles (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employee_code   VARCHAR(50) NOT NULL UNIQUE,
    designation     VARCHAR(100) NOT NULL DEFAULT 'Assistant Professor',
    department      VARCHAR(50) NOT NULL DEFAULT 'BCA',
    phone           VARCHAR(20)
);

CREATE TABLE student_profiles (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    reg_no              VARCHAR(50) NOT NULL UNIQUE,
    roll_no             VARCHAR(50),
    current_semester_id BIGINT REFERENCES semesters(id),
    section_id          BIGINT REFERENCES sections(id),
    mentor_id           BIGINT REFERENCES faculty_profiles(id),
    cgpa                NUMERIC(4,2) DEFAULT 0.0,
    attendance_pct      NUMERIC(5,2) DEFAULT 0.0,
    risk_status         VARCHAR(20) DEFAULT 'LOW'
);

CREATE TABLE faculty_assignments (
    id                  BIGSERIAL PRIMARY KEY,
    faculty_id          BIGINT NOT NULL REFERENCES faculty_profiles(id) ON DELETE CASCADE,
    subject_id          BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    section_id          BIGINT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    semester_id         BIGINT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    academic_year_id    BIGINT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    CONSTRAINT uq_fac_assignment UNIQUE (faculty_id, subject_id, section_id, semester_id)
);

CREATE INDEX idx_student_reg ON student_profiles(reg_no);
CREATE INDEX idx_student_sem ON student_profiles(current_semester_id);
CREATE INDEX idx_fac_assign ON faculty_assignments(faculty_id, subject_id);
