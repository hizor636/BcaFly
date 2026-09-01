/**
 * BcaFly Unified Workspace Store
 * Clean academic workspace data store with 6 independent semester structures.
 * All fake/hardcoded mock datasets have been purged. Data is populated dynamically
 * from user interactions, CSV/Excel imports, and database API services.
 */

const STORAGE_KEY = 'bcafly_workspace_v4';
const AUDIT_KEY = 'bcafly_audit_logs_v4';
const ACTIVITIES_KEY = 'bcafly_activities_v4';
const FILES_KEY = 'bcafly_academic_files_v4';
const TIMETABLE_KEY = 'bcafly_timetable_v4';
const ANNOUNCEMENTS_KEY = 'bcafly_announcements_v4';
const ASSIGNMENTS_KEY = 'bcafly_assignments_v4';
const SUBMISSIONS_KEY = 'bcafly_submissions_v4';
const MATERIALS_KEY = 'bcafly_materials_v4';
const ATTENDANCE_KEY = 'bcafly_attendance_v4';
const MARKS_KEY = 'bcafly_marks_v4';
const RESULTS_KEY = 'bcafly_results_v4';
const HELPDESK_KEY = 'bcafly_helpdesk_v4';
const NOTIFICATIONS_KEY = 'bcafly_notifications_v4';
const DOC_REQUESTS_KEY = 'bcafly_doc_requests_v4';
const LAB_KEY = 'bcafly_lab_experiments_v4';
const SESSIONS_KEY = 'bcafly_attendance_sessions_v4';
const RISK_CASES_KEY = 'bcafly_risk_cases_v4';
const ALLOCATIONS_KEY = 'bcafly_allocations_v4';
const BACKLOGS_KEY = 'bcafly_backlogs_v4';

export const MASTER_FACULTY = [
  { id: 'FAC01', name: 'Dr. B. K. Sharma', role: 'Professor & HOD', dept: 'Computer Applications', email: 'sharma@bcafly.edu', phone: '+91 98450 11223' },
  { id: 'FAC02', name: 'Dr. Ananya Rao', role: 'Professor', dept: 'Computer Applications', email: 'rao@bcafly.edu', phone: '+91 98450 22334' },
  { id: 'FAC03', name: 'Prof. Rahul Nair', role: 'Associate Professor', dept: 'Computer Applications', email: 'nair@bcafly.edu', phone: '+91 98450 33445' },
  { id: 'FAC04', name: 'Ms. Kavya Suresh', role: 'Assistant Professor', dept: 'Computer Applications', email: 'kavya@bcafly.edu', phone: '+91 98450 44556' }
];

export const INITIAL_SEMESTERS = {
  1: {
    id: 1,
    name: 'BCA Semester 1',
    term: '2026-27 ODD',
    batch: '2026–29',
    courses: [],
    students: []
  },
  2: {
    id: 2,
    name: 'BCA Semester 2',
    term: '2026-27 EVEN',
    batch: '2026–29',
    courses: [],
    students: []
  },
  3: {
    id: 3,
    name: 'BCA Semester 3',
    term: '2026-27 ODD',
    batch: '2025–28',
    courses: [],
    students: []
  },
  4: {
    id: 4,
    name: 'BCA Semester 4',
    term: '2026-27 EVEN',
    batch: '2025–28',
    courses: [],
    students: []
  },
  5: {
    id: 5,
    name: 'BCA Semester 5',
    term: '2026-27 ODD',
    batch: '2024–27',
    courses: [],
    students: []
  },
  6: {
    id: 6,
    name: 'BCA Semester 6',
    term: '2026-27 EVEN',
    batch: '2024–27',
    courses: [],
    students: []
  }
};

export const INITIAL_TIMETABLE_ENTRIES = [];
export const INITIAL_ANNOUNCEMENTS = [];
export const INITIAL_ASSIGNMENTS = [];
export const INITIAL_SUBMISSIONS = [];
export const INITIAL_COURSE_MATERIALS = [];
export const INITIAL_DETAILED_ATTENDANCE = {
  summary: [],
  records: [],
  correctionRequests: []
};
export const INITIAL_ASSESSMENT_MARKS = [];
export const INITIAL_EXAM_RESULTS = {
  history: [],
  cgpa: 0.0,
  totalCreditsEarned: 0,
  arrearCount: 0
};
export const INITIAL_HELPDESK_TICKETS = [];
export const INITIAL_NOTIFICATIONS = [];
export const INITIAL_DOCUMENT_REQUESTS = [];
export const INITIAL_ACTIVITIES = [];
export const INITIAL_ACADEMIC_FILES = [];
export const INITIAL_AUDIT_LOGS = [];
export const INITIAL_LAB_EXPERIMENTS = [];
export const INITIAL_ATTENDANCE_SESSIONS = [];
export const INITIAL_STUDENT_RISK_CASES = [];
export const INITIAL_FACULTY_ALLOCATIONS = [];
export const INITIAL_BACKLOG_RECORDS = [];

// LocalStorage Loaders & Savers with safe parsing and defaults

export function loadWorkspaceData() {
  if (typeof window === 'undefined') return INITIAL_SEMESTERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEMESTERS));
      return INITIAL_SEMESTERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_SEMESTERS;
  }
}

export function saveWorkspaceData(data) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadAuditLogs() {
  if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (!raw) {
      localStorage.setItem(AUDIT_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_AUDIT_LOGS;
  }
}

export function saveAuditLogs(logs) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
}

export function loadActivities() {
  if (typeof window === 'undefined') return INITIAL_ACTIVITIES;
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    if (!raw) {
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(INITIAL_ACTIVITIES));
      return INITIAL_ACTIVITIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_ACTIVITIES;
  }
}

export function saveActivities(acts) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(acts));
}

export function loadAcademicFiles() {
  if (typeof window === 'undefined') return INITIAL_ACADEMIC_FILES;
  try {
    const raw = localStorage.getItem(FILES_KEY);
    if (!raw) {
      localStorage.setItem(FILES_KEY, JSON.stringify(INITIAL_ACADEMIC_FILES));
      return INITIAL_ACADEMIC_FILES;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_ACADEMIC_FILES;
  }
}

export function saveAcademicFiles(files) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
}

export function loadTimetableEntries() {
  if (typeof window === 'undefined') return INITIAL_TIMETABLE_ENTRIES;
  try {
    const raw = localStorage.getItem(TIMETABLE_KEY);
    if (!raw) {
      localStorage.setItem(TIMETABLE_KEY, JSON.stringify(INITIAL_TIMETABLE_ENTRIES));
      return INITIAL_TIMETABLE_ENTRIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_TIMETABLE_ENTRIES;
  }
}

export function saveTimetableEntries(entries) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TIMETABLE_KEY, JSON.stringify(entries));
}

export function loadAnnouncements() {
  if (typeof window === 'undefined') return INITIAL_ANNOUNCEMENTS;
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_KEY);
    if (!raw) {
      localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(INITIAL_ANNOUNCEMENTS));
      return INITIAL_ANNOUNCEMENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_ANNOUNCEMENTS;
  }
}

export function saveAnnouncements(announcements) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
}

export function loadAssignments() {
  if (typeof window === 'undefined') return INITIAL_ASSIGNMENTS;
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    if (!raw) {
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(INITIAL_ASSIGNMENTS));
      return INITIAL_ASSIGNMENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_ASSIGNMENTS;
  }
}

export function saveAssignments(assignments) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

export function loadSubmissions() {
  if (typeof window === 'undefined') return INITIAL_SUBMISSIONS;
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_SUBMISSIONS;
  }
}

export function saveSubmissions(subs) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(subs));
}

export function loadCourseMaterials() {
  if (typeof window === 'undefined') return INITIAL_COURSE_MATERIALS;
  try {
    const raw = localStorage.getItem(MATERIALS_KEY);
    if (!raw) {
      localStorage.setItem(MATERIALS_KEY, JSON.stringify(INITIAL_COURSE_MATERIALS));
      return INITIAL_COURSE_MATERIALS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_COURSE_MATERIALS;
  }
}

export function saveCourseMaterials(mats) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MATERIALS_KEY, JSON.stringify(mats));
}

export function loadDetailedAttendance() {
  if (typeof window === 'undefined') return INITIAL_DETAILED_ATTENDANCE;
  try {
    const raw = localStorage.getItem(ATTENDANCE_KEY);
    if (!raw) {
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(INITIAL_DETAILED_ATTENDANCE));
      return INITIAL_DETAILED_ATTENDANCE;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_DETAILED_ATTENDANCE;
  }
}

export function saveDetailedAttendance(att) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(att));
}

export function loadAssessmentMarks() {
  if (typeof window === 'undefined') return INITIAL_ASSESSMENT_MARKS;
  try {
    const raw = localStorage.getItem(MARKS_KEY);
    if (!raw) {
      localStorage.setItem(MARKS_KEY, JSON.stringify(INITIAL_ASSESSMENT_MARKS));
      return INITIAL_ASSESSMENT_MARKS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_ASSESSMENT_MARKS;
  }
}

export function saveAssessmentMarks(marks) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MARKS_KEY, JSON.stringify(marks));
}

export function loadExamResults() {
  if (typeof window === 'undefined') return INITIAL_EXAM_RESULTS;
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (!raw) {
      localStorage.setItem(RESULTS_KEY, JSON.stringify(INITIAL_EXAM_RESULTS));
      return INITIAL_EXAM_RESULTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_EXAM_RESULTS;
  }
}

export function saveExamResults(results) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

export function loadHelpdeskTickets() {
  if (typeof window === 'undefined') return INITIAL_HELPDESK_TICKETS;
  try {
    const raw = localStorage.getItem(HELPDESK_KEY);
    if (!raw) {
      localStorage.setItem(HELPDESK_KEY, JSON.stringify(INITIAL_HELPDESK_TICKETS));
      return INITIAL_HELPDESK_TICKETS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_HELPDESK_TICKETS;
  }
}

export function saveHelpdeskTickets(tickets) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HELPDESK_KEY, JSON.stringify(tickets));
}

export function loadNotifications() {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifs) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
}

export function loadDocumentRequests() {
  if (typeof window === 'undefined') return INITIAL_DOCUMENT_REQUESTS;
  try {
    const raw = localStorage.getItem(DOC_REQUESTS_KEY);
    if (!raw) {
      localStorage.setItem(DOC_REQUESTS_KEY, JSON.stringify(INITIAL_DOCUMENT_REQUESTS));
      return INITIAL_DOCUMENT_REQUESTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_DOCUMENT_REQUESTS;
  }
}

export function saveDocumentRequests(reqs) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DOC_REQUESTS_KEY, JSON.stringify(reqs));
}

export function loadLabExperiments() {
  if (typeof window === 'undefined') return INITIAL_LAB_EXPERIMENTS;
  try {
    const raw = localStorage.getItem(LAB_KEY);
    if (!raw) {
      localStorage.setItem(LAB_KEY, JSON.stringify(INITIAL_LAB_EXPERIMENTS));
      return INITIAL_LAB_EXPERIMENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_LAB_EXPERIMENTS;
  }
}

export function saveLabExperiments(exps) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAB_KEY, JSON.stringify(exps));
}

export function loadAttendanceSessions() {
  if (typeof window === 'undefined') return INITIAL_ATTENDANCE_SESSIONS;
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(INITIAL_ATTENDANCE_SESSIONS));
      return INITIAL_ATTENDANCE_SESSIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_ATTENDANCE_SESSIONS;
  }
}

export function saveAttendanceSessions(sessions) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function loadStudentRiskCases() {
  if (typeof window === 'undefined') return INITIAL_STUDENT_RISK_CASES;
  try {
    const raw = localStorage.getItem(RISK_CASES_KEY);
    if (!raw) {
      localStorage.setItem(RISK_CASES_KEY, JSON.stringify(INITIAL_STUDENT_RISK_CASES));
      return INITIAL_STUDENT_RISK_CASES;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_STUDENT_RISK_CASES;
  }
}

export function saveStudentRiskCases(cases) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RISK_CASES_KEY, JSON.stringify(cases));
}

export function loadFacultyAllocations() {
  if (typeof window === 'undefined') return INITIAL_FACULTY_ALLOCATIONS;
  try {
    const raw = localStorage.getItem(ALLOCATIONS_KEY);
    if (!raw) {
      localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(INITIAL_FACULTY_ALLOCATIONS));
      return INITIAL_FACULTY_ALLOCATIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_FACULTY_ALLOCATIONS;
  }
}

export function saveFacultyAllocations(allocs) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(allocs));
}

export function loadBacklogRecords() {
  if (typeof window === 'undefined') return INITIAL_BACKLOG_RECORDS;
  try {
    const raw = localStorage.getItem(BACKLOGS_KEY);
    if (!raw) {
      localStorage.setItem(BACKLOGS_KEY, JSON.stringify(INITIAL_BACKLOG_RECORDS));
      return INITIAL_BACKLOG_RECORDS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_BACKLOG_RECORDS;
  }
}

export function saveBacklogRecords(bls) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BACKLOGS_KEY, JSON.stringify(bls));
}
