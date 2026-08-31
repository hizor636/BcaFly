-- V14: System Reset Logs Schema

CREATE TABLE IF NOT EXISTS system_reset_logs (
    id VARCHAR(100) PRIMARY KEY,
    reset_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL DEFAULT 'DATABASE_RESET_COMPLETED',
    reset_mode VARCHAR(50) NOT NULL,
    semester_id INT,
    academic_year_id VARCHAR(50),
    requested_by VARCHAR(100),
    backup_location VARCHAR(255),
    affected_records INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
