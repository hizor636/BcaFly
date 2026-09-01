-- ====================================================================
-- SUB-DATABASE 10: Helpdesk Tickets, Document Orders & Notifications
-- Domain: Student Support, Official Document Requests, Announcements
-- ====================================================================

-- 1. SYSTEM NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT NOT NULL,
    title               VARCHAR(200) NOT NULL,
    message             TEXT NOT NULL,
    notification_type   VARCHAR(30) NOT NULL DEFAULT 'GENERAL',
    link                VARCHAR(200),
    is_read             BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_read (is_read),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='System alerts and role notifications';

-- 2. HELPDESK TICKETS
CREATE TABLE IF NOT EXISTS helpdesk_tickets (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    category            VARCHAR(50) NOT NULL,
    subject             VARCHAR(200) NOT NULL,
    description         TEXT NOT NULL,
    priority            ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    status              ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REOPENED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    assigned_to         BIGINT NULL,
    resolution_deadline DATETIME NULL,
    resolved_at         DATETIME NULL,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ticket_status (status),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Student support helpdesk ticketing system';

-- 3. OFFICIAL DOCUMENT REQUESTS
CREATE TABLE IF NOT EXISTS document_requests (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id          BIGINT NOT NULL,
    document_type       VARCHAR(100) NOT NULL, -- 'Bonafide Certificate', 'Fee Receipt', 'Transcript', 'LOR'
    purpose             VARCHAR(255) NOT NULL,
    status              ENUM('PENDING', 'PROCESSING', 'READY', 'DELIVERED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    download_url        VARCHAR(500),
    requested_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at        DATETIME NULL,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Student requests for official certificates and transcripts';

-- SAMPLE QUERIES FOR THIS SUB-DATABASE:
-- 1. View all open helpdesk tickets needing resolution:
-- SELECT ht.id, sp.reg_no, ht.category, ht.subject, ht.priority, ht.created_at FROM helpdesk_tickets ht JOIN student_profiles sp ON ht.student_id = sp.id WHERE ht.status = 'OPEN' ORDER BY FIELD(ht.priority, 'URGENT', 'HIGH', 'MEDIUM', 'LOW');
-- 2. View pending document requests:
-- SELECT dr.id, sp.reg_no, dr.document_type, dr.purpose, dr.requested_at FROM document_requests dr JOIN student_profiles sp ON dr.student_id = sp.id WHERE dr.status = 'PENDING';
