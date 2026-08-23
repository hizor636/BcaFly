/**
 * BcaFly Unified Workspace Store
 * Manages 6-semester isolated academic datasets, persistence in localStorage,
 * academic file uploads, and state mutation helpers with audit logging.
 */

const STORAGE_KEY = 'bcafly_workspace_v2';
const AUDIT_KEY = 'bcafly_audit_logs_v2';
const ACTIVITIES_KEY = 'bcafly_activities_v2';
const FILES_KEY = 'bcafly_academic_files_v2';

export const MASTER_FACULTY = [
  { id: 'FAC01', name: 'Dr. A. Sharma', role: 'Professor & HOD', dept: 'Computer Applications', email: 'sharma@bcafly.edu', phone: '+91 98450 11223' },
  { id: 'FAC02', name: 'Prof. K. Rao', role: 'Associate Professor', dept: 'Computer Applications', email: 'rao@bcafly.edu', phone: '+91 98450 22334' },
  { id: 'FAC03', name: 'Prof. M. Varma', role: 'Assistant Professor', dept: 'Computer Applications', email: 'varma@bcafly.edu', phone: '+91 98450 33445' },
  { id: 'FAC04', name: 'Dr. S. Nair', role: 'Associate Professor', dept: 'Computer Applications', email: 'nair@bcafly.edu', phone: '+91 98450 44556' },
  { id: 'FAC05', name: 'Prof. R. Deshmukh', role: 'Assistant Professor', dept: 'Humanities & Management', email: 'deshmukh@bcafly.edu', phone: '+91 98450 55667' }
];

export const INITIAL_SEMESTERS = {
  1: {
    id: 1,
    name: 'BCA Semester 1',
    term: '2025-26 ODD',
    batch: '2025–28',
    courses: [
      { id: 'c-101', code: 'BCA101', name: 'Programming Fundamentals in C', type: 'Core Theory', credits: 4, facultyId: 'FAC01', room: 'Room 101' },
      { id: 'c-102', code: 'BCA102', name: 'Discrete Mathematics', type: 'Core Theory', credits: 4, facultyId: 'FAC03', room: 'Room 102' },
      { id: 'c-103', code: 'BCA103', name: 'Digital Logic & Computer Design', type: 'Core Theory', credits: 4, facultyId: 'FAC04', room: 'Room 103' },
      { id: 'c-104', code: 'BCA104', name: 'Professional Communication', type: 'Ability Enhancement', credits: 3, facultyId: 'FAC05', room: 'Room 104' },
      { id: 'c-105', code: 'BCA105L', name: 'C Programming Laboratory', type: 'Laboratory', credits: 2, facultyId: 'FAC01', room: 'Computer Lab 1' }
    ],
    students: [
      { id: "student-s1-001", reg: 'BCS24CA001', usn: 'BCS24CA001', name: 'Ananya Sharma', section: 'A', batch: '2025–28', attendance: 94, sgpa: 9.40, cgpa: 9.40, status: 'Active', backlogCount: 0, resultStatus: 'PASS' },
      { id: "101", reg: '1BC25001', usn: '1BC25001', name: 'Kabir Mehta', section: 'A', batch: '2025–28', attendance: 91, sgpa: 8.60, cgpa: 8.60, status: 'Active', backlogCount: 0, resultStatus: 'PASS' },
      { id: "102", reg: '1BC25002', usn: '1BC25002', name: 'Pooja Bhatt', section: 'A', batch: '2025–28', attendance: 88, sgpa: 8.90, cgpa: 8.90, status: 'Active', backlogCount: 0, resultStatus: 'PASS' },
      { id: "103", reg: '1BC25003', usn: '1BC25003', name: 'Arjun Das', section: 'A', batch: '2025–28', attendance: 72, sgpa: 6.90, cgpa: 6.90, status: 'Active', backlogCount: 1, resultStatus: 'FAIL' },
      { id: "104", reg: '1BC25004', usn: '1BC25004', name: 'Neha Singhal', section: 'B', batch: '2025–28', attendance: 94, sgpa: 9.40, cgpa: 9.40, status: 'Active', backlogCount: 0, resultStatus: 'PASS' }
    ]
  },
  2: {
    id: 2,
    name: 'BCA Semester 2',
    term: '2024-25 EVEN',
    batch: '2024–27',
    courses: [
      { id: 'c-201', code: 'BCA201', name: 'Data Structures with C++', type: 'Core Theory', credits: 4, facultyId: 'FAC02', room: 'Room 201' },
      { id: 'c-202', code: 'BCA202', name: 'Object Oriented Programming', type: 'Core Theory', credits: 4, facultyId: 'FAC01', room: 'Room 202' },
      { id: 'c-203', code: 'BCA203', name: 'Financial Accounting & Management', type: 'General Elective', credits: 3, facultyId: 'FAC05', room: 'Room 203' },
      { id: 'c-204', code: 'BCA204', name: 'Environmental Science', type: 'Ability Enhancement', credits: 3, facultyId: 'FAC03', room: 'Room 204' },
      { id: 'c-205', code: 'BCA205L', name: 'Data Structures Lab', type: 'Laboratory', credits: 2, facultyId: 'FAC02', room: 'Computer Lab 2' }
    ],
    students: [
      { id: "201", reg: '1BC24001', usn: '1BC24001', name: 'Aarav Nair', section: 'A', batch: '2024–27', attendance: 90, sgpa: 8.95, cgpa: 8.90, status: 'Active', backlogCount: 0, resultStatus: 'PASS' },
      { id: "202", reg: '1BC24002', usn: '1BC24002', name: 'Diya Menon', section: 'A', batch: '2024–27', attendance: 93, sgpa: 9.30, cgpa: 9.32, status: 'Active', backlogCount: 0, resultStatus: 'PASS' },
      { id: "203", reg: '1BC24003', usn: '1BC24003', name: 'Rohan Gupta', section: 'A', batch: '2024–27', attendance: 76, sgpa: 7.10, cgpa: 7.15, status: 'Active', backlogCount: 0, resultStatus: 'PASS' }
    ]
  },
  3: {
    id: 3,
    name: 'BCA Semester 3',
    term: '2025-26 ODD',
    batch: '2024–27',
    courses: [
      { id: 'c-301', code: 'BCA301', name: 'Relational Database Management Systems (RDBMS)', type: 'Core Theory', credits: 4, facultyId: 'FAC01', room: 'Room 301' },
      { id: 'c-302', code: 'BCA302', name: 'Java Programming & OOP Concepts', type: 'Core Theory', credits: 4, facultyId: 'FAC02', room: 'Room 302' },
      { id: 'c-303', code: 'BCA303', name: 'Computer Networks & Architecture', type: 'Core Theory', credits: 4, facultyId: 'FAC03', room: 'Room 303' },
      { id: 'c-304', code: 'BCA304', name: 'Operating Systems Principles', type: 'Core Theory', credits: 4, facultyId: 'FAC04', room: 'Room 304' },
      { id: 'c-305', code: 'BCA305L', name: 'DBMS & Java Programming Lab', type: 'Laboratory', credits: 2, facultyId: 'FAC02', room: 'Database Lab' }
    ],
    students: [
      { id: "student-s3-001", reg: 'BCS23CA001', usn: 'BCS23CA001', name: 'Rahul Kumar', section: 'A', batch: '2024–27', attendance: 88, sgpa: 8.85, cgpa: 8.92, status: 'Active', backlogCount: 0, resultStatus: 'PASS' },
      { id: "301", reg: '1BC24001', usn: '1BC24001', name: 'Aarav Nair', section: 'A', batch: '2024–27', attendance: 88, sgpa: 8.85, cgpa: 8.92, status: 'Active', backlogCount: 0, resultStatus: 'PASS' },
      { id: "302", reg: '1BC24002', usn: '1BC24002', name: 'Diya Menon', section: 'A', batch: '2024–27', attendance: 92, sgpa: 9.40, cgpa: 9.35, status: 'Active', backlogCount: 0, resultStatus: 'PASS' },
      { id: "303", reg: '1BC24003', usn: '1BC24003', name: 'Rohan Gupta', section: 'A', batch: '2024–27', attendance: 71, sgpa: 7.15, cgpa: 7.20, status: 'Active', backlogCount: 1, resultStatus: 'FAIL' },
      { id: "304", reg: '1BC24004', usn: '1BC24004', name: 'Ananya Iyer', section: 'A', batch: '2024–27', attendance: 84, sgpa: 8.30, cgpa: 8.40, status: 'Active', backlogCount: 0, resultStatus: 'PASS' },
      { id: "305", reg: '1BC24005', usn: '1BC24005', name: 'Vikram Joshi', section: 'B', batch: '2024–27', attendance: 68, sgpa: 6.50, cgpa: 6.80, status: 'Active', backlogCount: 2, resultStatus: 'FAIL' },
      { id: "306", reg: '1BC24006', usn: '1BC24006', name: 'Sneha Patel', section: 'B', batch: '2024–27', attendance: 95, sgpa: 9.70, cgpa: 9.60, status: 'Active', backlogCount: 0, resultStatus: 'PASS' },
      { id: "307", reg: '1BC24007', usn: '1BC24007', name: 'Karthik Raja', section: 'B', batch: '2024–27', attendance: 79, sgpa: 8.00, cgpa: 7.90, status: 'Active', backlogCount: 0, resultStatus: 'PASS' },
      { id: "308", reg: '1BC24008', usn: '1BC24008', name: 'Pooja Hegde', section: 'A', batch: '2024–27', attendance: 86, sgpa: 8.60, cgpa: 8.75, status: 'Active', backlogCount: 0, resultStatus: 'PASS' }
    ]
  },
  4: {
    id: 4,
    name: 'BCA Semester 4',
    term: '2024-25 EVEN',
    batch: '2023–26',
    courses: [
      { id: 'c-401', code: 'BCA401', name: 'Software Engineering & Agile Methodologies', type: 'Core Theory', credits: 4, facultyId: 'FAC04', room: 'Room 401' },
      { id: 'c-402', code: 'BCA402', name: 'Python for Data Analytics', type: 'Core Theory', credits: 4, facultyId: 'FAC03', room: 'Room 402' },
      { id: 'c-403', code: 'BCA403', name: 'Web Technologies (HTML5/CSS3/JavaScript)', type: 'Core Theory', credits: 4, facultyId: 'FAC02', room: 'Room 403' },
      { id: 'c-404', code: 'BCA404', name: 'Optimization Techniques', type: 'Allied Theory', credits: 4, facultyId: 'FAC05', room: 'Room 404' },
      { id: 'c-405', code: 'BCA405L', name: 'Web Development & Python Lab', type: 'Laboratory', credits: 2, facultyId: 'FAC02', room: 'Web Lab' }
    ],
    students: [
      { id: "401", reg: '1BC23001', usn: '1BC23001', name: 'Siddharth Rao', section: 'A', batch: '2023–26', attendance: 89, sgpa: 8.70, cgpa: 8.65, status: 'Active', backlogCount: 0, resultStatus: 'PASS' },
      { id: "402", reg: '1BC23002', usn: '1BC23002', name: 'Tanvi Saxena', section: 'A', batch: '2023–26', attendance: 93, sgpa: 9.20, cgpa: 9.15, status: 'Active', backlogCount: 0, resultStatus: 'PASS' },
      { id: "403", reg: '1BC23003', usn: '1BC23003', name: 'Kiran Kulkarni', section: 'B', batch: '2023–26', attendance: 74, sgpa: 7.00, cgpa: 7.10, status: 'Active', backlogCount: 1, resultStatus: 'FAIL' }
    ]
  },
  5: {
    id: 5,
    name: 'BCA Semester 5',
    term: '2025-26 ODD',
    batch: '2023–26',
    courses: [
      { id: 'c-501', code: 'BCA501', name: 'Cloud Computing & DevOps Practices', type: 'Core Theory', credits: 4, facultyId: 'FAC01', room: 'Room 501' },
      { id: 'c-502', code: 'BCA502', name: 'Mobile App Development (Flutter/Android)', type: 'Core Theory', credits: 4, facultyId: 'FAC02', room: 'Room 502' },
      { id: 'c-503', code: 'BCA503E', name: 'Elective: Artificial Intelligence & Expert Systems', type: 'Discipline Elective', credits: 4, facultyId: 'FAC04', room: 'Room 503' },
      { id: 'c-504', code: 'BCA504', name: 'Information Security & Cryptography', type: 'Core Theory', credits: 4, facultyId: 'FAC03', room: 'Room 504' },
      { id: 'c-505', code: 'BCA505P', name: 'Mini Project & Technical Seminar', type: 'Project', credits: 3, facultyId: 'FAC01', room: 'Innovation Lab' }
    ],
    students: [
      { id: "501", reg: '1BC23001', usn: '1BC23001', name: 'Siddharth Rao', section: 'A', batch: '2023–26', attendance: 90, sgpa: 8.80, cgpa: 8.70, status: 'Active', backlogCount: 0, resultStatus: 'PASS' },
      { id: "502", reg: '1BC23002', usn: '1BC23002', name: 'Tanvi Saxena', section: 'A', batch: '2023–26', attendance: 94, sgpa: 9.35, cgpa: 9.20, status: 'Active', backlogCount: 0, resultStatus: 'PASS' },
      { id: "503", reg: '1BC23004', usn: '1BC23004', name: 'Aditya Roy', section: 'A', batch: '2023–26', attendance: 82, sgpa: 8.10, cgpa: 8.05, status: 'Active', backlogCount: 0, resultStatus: 'PASS' }
    ]
  },
  6: {
    id: 6,
    name: 'BCA Semester 6',
    term: '2024-25 EVEN',
    batch: '2022–25',
    courses: [
      { id: 'c-601', code: 'BCA601', name: 'Full Stack Enterprise Development', type: 'Core Theory', credits: 4, facultyId: 'FAC02', room: 'Room 601' },
      { id: 'c-602', code: 'BCA602E', name: 'Elective: Machine Learning & Big Data', type: 'Discipline Elective', credits: 4, facultyId: 'FAC04', room: 'Room 602' },
      { id: 'c-603', code: 'BCA603', name: 'Cyber Law, Ethics & Intellectual Property', type: 'Allied Theory', credits: 3, facultyId: 'FAC05', room: 'Room 603' },
      { id: 'c-604', code: 'BCA604I', name: 'Industry Internship & Capstone Project', type: 'Major Capstone', credits: 8, facultyId: 'FAC01', room: 'Incubation Centre' },
      { id: 'c-605', code: 'BCA605', name: 'Comprehensive Viva Voce', type: 'Viva', credits: 2, facultyId: 'FAC01', room: 'Seminar Hall' }
    ],
    students: [
      { id: "601", reg: '1BC22001', usn: '1BC22001', name: 'Manoj Kumar', section: 'A', batch: '2022–25', attendance: 92, sgpa: 9.10, cgpa: 9.05, status: 'Active', backlogCount: 0, resultStatus: 'PASS' },
      { id: "602", reg: '1BC22002', usn: '1BC22002', name: 'Ananya Sen', section: 'A', batch: '2022–25', attendance: 96, sgpa: 9.50, cgpa: 9.45, status: 'Active', backlogCount: 0, resultStatus: 'PASS' }
    ]
  }
};

export const INITIAL_ACTIVITIES = [
  { id: 'ACT-101', sem: 3, studentId: 'student-s3-001', studentName: 'Rahul Kumar', reg: 'BCS23CA001', title: 'National Level Hackathon 2025', org: 'IIT Madras', date: '2025-08-12', category: 'Hackathon', od: true, status: 'VERIFIED', skills: 'React, PostgreSQL, REST' },
  { id: 'ACT-102', sem: 3, studentId: '301', studentName: 'Aarav Nair', reg: '1BC24001', title: 'National Level Hackathon 2025', org: 'IIT Madras', date: '2025-08-12', category: 'Hackathon', od: true, status: 'VERIFIED', skills: 'React, PostgreSQL, REST' },
  { id: 'ACT-103', sem: 3, studentId: '302', studentName: 'Diya Menon', reg: '1BC24002', title: 'AWS Cloud Practitioner Certification', org: 'Amazon Web Services', date: '2025-07-20', category: 'Certification', od: false, status: 'VERIFIED', skills: 'Cloud Architecture, AWS' },
  { id: 'ACT-104', sem: 3, studentId: 'student-s3-001', studentName: 'Rahul Kumar', reg: 'BCS23CA001', title: 'State Level Web Dev Symposium', org: 'Anna University', date: '2025-09-05', category: 'Symposium', od: true, status: 'PENDING', skills: 'Tailwind CSS, Node.js' }
];

export const INITIAL_ACADEMIC_FILES = [
  {
    id: 'FILE-101',
    fileName: 'CIA_1_RDBMS_Master_Scores.xlsx',
    storedName: 'sec3_cia1_rdbms_2026.xlsx',
    ext: 'XLSX',
    size: '1.2 MB',
    sizeBytes: 1258291,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    sem: 3,
    courseCode: 'BCA301',
    studentId: null,
    studentName: 'All Enrolled Students',
    recordType: 'Assessment',
    title: 'CIA 1 Marksheet — RDBMS',
    description: 'Continuous Internal Assessment 1 compiled scores with component breakup.',
    uploadedBy: 'Dr. A. Sharma',
    uploaderRole: 'ADMINISTRATOR',
    uploadedAt: '23 Aug 2026, 10:30 AM',
    visibility: 'All'
  },
  {
    id: 'FILE-102',
    fileName: 'Semester_3_Attendance_Shortage_Register.pdf',
    storedName: 'sem3_att_shortage_signed.pdf',
    ext: 'PDF',
    size: '845 KB',
    sizeBytes: 865280,
    mimeType: 'application/pdf',
    sem: 3,
    courseCode: 'ALL',
    studentId: null,
    studentName: 'Department Consolidated',
    recordType: 'Attendance',
    title: 'Official Attendance Shortage Notice (Sem 3)',
    description: 'Signed attendance shortage statement for condonation submission.',
    uploadedBy: 'Dr. A. Sharma',
    uploaderRole: 'HOD',
    uploadedAt: '23 Aug 2026, 11:15 AM',
    visibility: 'All'
  },
  {
    id: 'FILE-103',
    fileName: 'Rahul_Kumar_Hackathon_Certificate.pdf',
    storedName: 'rahul_iit_madras_hackathon.pdf',
    ext: 'PDF',
    size: '2.4 MB',
    sizeBytes: 2516582,
    mimeType: 'application/pdf',
    sem: 3,
    courseCode: 'N/A',
    studentId: 'student-s3-001',
    studentName: 'Rahul Kumar',
    recordType: 'Activity Portfolio',
    title: 'IIT Madras National Hackathon Merit Certificate',
    description: 'First prize certificate in Full Stack Web Track (Requesting OD credit).',
    uploadedBy: 'Rahul Kumar',
    uploaderRole: 'STUDENT',
    uploadedAt: '22 Aug 2026, 04:45 PM',
    visibility: 'All'
  },
  {
    id: 'FILE-104',
    fileName: 'BCA_Sem3_End_Semester_Result_Gazette.xlsx',
    storedName: 'bca_s3_results_gazette_2026.xlsx',
    ext: 'XLSX',
    size: '3.1 MB',
    sizeBytes: 3250585,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    sem: 3,
    courseCode: 'ALL',
    studentId: null,
    studentName: 'All Students',
    recordType: 'Result',
    title: 'Semester 3 University Examination Gazette',
    description: 'Controller of Examinations signed result ledger and SGPA records.',
    uploadedBy: 'Dr. A. Sharma',
    uploaderRole: 'ADMINISTRATOR',
    uploadedAt: '20 Aug 2026, 02:00 PM',
    visibility: 'All'
  }
];

export const INITIAL_AUDIT_LOGS = [
  { id: 'AUD-101', time: '10:00 AM', actor: 'Dr. A. Sharma', role: 'ADMINISTRATOR', action: 'Semester Workspace Init', details: 'Initialized isolated BCA Academic Workspaces for Semesters 1 to 6.' },
  { id: 'AUD-102', time: '10:15 AM', actor: 'Prof. K. Rao', role: 'FACULTY', action: 'Attendance Recorded', details: 'Attendance marked for BCA302 (Java OOP) — 9 Present, 0 Absent.' }
];

export const INITIAL_TIMETABLE = {
  3: [
    { day: 'Monday', slot1: 'BCA301 (Room 301)', slot2: 'BCA302 (Room 302)', slot3: 'BCA303 (Room 303)', slot4: 'BCA305L (DB Lab)', slot5: 'BCA305L (DB Lab)' },
    { day: 'Tuesday', slot1: 'BCA302 (Room 302)', slot2: 'BCA304 (Room 304)', slot3: 'BCA301 (Room 301)', slot4: 'Library / Seminar', slot5: 'Mentoring' },
    { day: 'Wednesday', slot1: 'BCA303 (Room 303)', slot2: 'BCA301 (Room 301)', slot3: 'BCA304 (Room 304)', slot4: 'BCA302 (Room 302)', slot5: 'Sports' },
    { day: 'Thursday', slot1: 'BCA304 (Room 304)', slot2: 'BCA303 (Room 303)', slot3: 'BCA302 (Room 302)', slot4: 'BCA305L (Java Lab)', slot5: 'BCA305L (Java Lab)' },
    { day: 'Friday', slot1: 'BCA301 (Room 301)', slot2: 'BCA304 (Room 304)', slot3: 'BCA303 (Room 303)', slot4: 'Club Activity', slot5: 'Placement Training' }
  ]
};

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
