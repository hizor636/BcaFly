# BcaFly Security Policy & Architecture Guidelines

## 1. Purpose & Scope
BcaFly is an institutional academic management platform handling student personal details, attendance records, internal and external marks, exam results, assignments, study materials, faculty workloads, and official academic documents.

This document outlines the mandatory security controls, authorization models, and secure coding practices enforced across BcaFly.

---

## 2. Platform Authority Hierarchy & Role-Based Access Control (RBAC)

BcaFly enforces a **deny-by-default, server-side permission model** on every single request:

```text
SUPER ADMIN
    ↓
ADMINISTRATOR  (Global workspace setup, student enrolment, faculty allocation, timetable, records, locking)
    ↓
HOD            (Department academic monitoring, approval decisions, at-risk interventions, backlog remedial plans)
    ↓
FACULTY        (Assigned course attendance, marks entry, assignments, materials, student query replies)
    ↓
STUDENT        (Personal-access-only: own profile, own attendance, own marks, own results, own submissions)
```

### Core Security Principle
> **All permissions and scope boundaries MUST be checked in backend code (`SecurityConfig`, `@PreAuthorize`, and `ScopeValidator`).** Frontend UI hiding or route guards are never considered security controls on their own.

---

## 3. Data Privacy & IDOR Protection

1. **Student Privacy**:
   - Students can NEVER view another student's profile, attendance records, assessment marks, or exam results.
   - Any query to `/api/student/*` derives the student identity exclusively from the authenticated JWT token. Passing arbitrary `studentId` query parameters to access other records is blocked and returns `HTTP 403 Forbidden`.
2. **Faculty Privacy**:
   - Faculty can only access student lists, attendance sheets, and marks registers for courses and sections actively allocated to them.
3. **HOD Privacy**:
   - HOD authority is strictly scoped to their assigned department (e.g., Computer Applications). Access to cross-department data is prohibited.
4. **Administrator Safeguards**:
   - Locked semester ledgers cannot be modified without formal unlocking workflows.
   - Audit logs are immutable and append-only.

---

## 4. Secure File Upload Rules

File uploads (e.g., nominal rolls, study materials, student activity certificates, lab code archives) are governed by OWASP guidelines:

- **Allowed Extensions**: `PDF`, `DOCX`, `PPTX`, `XLSX`, `CSV`, `JPG`, `JPEG`, `PNG`, `ZIP`.
- **Blocked Extensions**: `.exe`, `.sh`, `.bat`, `.cmd`, `.vbs`, `.js`, `.py`, `.php`, `.jsp`, `.asp`, `.apk`, `.com`, `.scr`.
- **Maximum File Size**: 25 MB per file.
- **Server-Side File Renaming**: Files are renamed to randomized UUIDs (e.g., `3f5a1b2c-....pdf`) to prevent path traversal, file overwriting, and directory probing.
- **Protected Storage**: Files are stored outside the public web root (`storage/uploads`) and served only after backend authentication and ownership verification.
- **Audit Logging**: Every upload and deletion creates an immutable entry in `audit_logs`.

---

## 5. Security Headers & Deployment Controls

### Production Headers (`vercel.json`)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### Git & Secret Protection (`.gitignore`)
- Real environment files (`.env`, `.env.*`), database credentials, private keys (`*.pem`, `*.key`), and production database dumps (`*.sql`, `*.db`) are strictly ignored.
- Only `.env.example` containing dummy variable templates is maintained in source control.

---

## 6. Immutable Audit Trail

All critical academic governance operations must be logged to the `audit_logs` database table:

- Student enrolments, promotions, or withdrawals
- CSV/XLSX nominal roll bulk imports
- Faculty course allocations and modifications
- Session attendance submissions and corrections
- Internal marks entries and publications
- HOD approval and sanction decisions
- Timetable sanctions and publications
- Academic record locks and unlocks
- File uploads and deletions

### Never-Log Policy:
Audit logs never record plain-text passwords, session cookies, raw JWT tokens, database passwords, or private student documents.

---

## 7. Incident Response Plan

1. **Exposed Credential or Secret**:
   - Revoke/rotate the secret immediately.
   - Remove the key from repository history and deployment environment variables.
   - Restart all backend services.
   - Review audit logs for unauthorized access during the exposure window.
2. **Compromised Account**:
   - Deactivate the user account in the database (`is_active = false`).
   - Revoke active JWT sessions.
   - Trigger an administrator password reset.
   - Audit all actions performed by the account and revert unauthorized changes.
3. **Data Access Anomaly**:
   - Temporarily disable the affected endpoint.
   - Isolate affected records and patch authorization in `ScopeValidator` / `SecurityConfig`.
   - Add automated regression tests to prevent recurrence.
