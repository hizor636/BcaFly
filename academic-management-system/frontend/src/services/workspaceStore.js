/**
 * BcaFly Unified Workspace Store
 * Manages 6-semester isolated academic datasets, persistence in localStorage,
 * academic file uploads, timetable entries, announcements, assignments,
 * course materials, detailed attendance, assessment marks, exam results,
 * activity/OD workflows, helpdesk tickets, and student profile requests.
 */

const STORAGE_KEY = 'bcafly_workspace_v3';
const AUDIT_KEY = 'bcafly_audit_logs_v3';
const ACTIVITIES_KEY = 'bcafly_activities_v3';
const FILES_KEY = 'bcafly_academic_files_v3';
const TIMETABLE_KEY = 'bcafly_timetable_v3';
const ANNOUNCEMENTS_KEY = 'bcafly_announcements_v3';
const ASSIGNMENTS_KEY = 'bcafly_assignments_v3';
const SUBMISSIONS_KEY = 'bcafly_submissions_v3';
const MATERIALS_KEY = 'bcafly_materials_v3';
const ATTENDANCE_KEY = 'bcafly_attendance_v3';
const MARKS_KEY = 'bcafly_marks_v3';
const RESULTS_KEY = 'bcafly_results_v3';
const HELPDESK_KEY = 'bcafly_helpdesk_v3';
const NOTIFICATIONS_KEY = 'bcafly_notifications_v3';
const DOC_REQUESTS_KEY = 'bcafly_doc_requests_v3';

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
      { id: 'BCA301', code: 'BCA301', name: 'Relational Database Management Systems (RDBMS)', title: 'Relational Database Management Systems (RDBMS)', type: 'Core Theory', credits: 4, facultyId: 'FAC01', room: 'Room 301' },
      { id: 'BCA302', code: 'BCA302', name: 'Java Programming & OOP Concepts', title: 'Java Programming & OOP Concepts', type: 'Core Theory', credits: 4, facultyId: 'FAC02', room: 'Room 302' },
      { id: 'BCA303', code: 'BCA303', name: 'Computer Networks & Architecture', title: 'Computer Networks & Architecture', type: 'Core Theory', credits: 4, facultyId: 'FAC03', room: 'Room 303' },
      { id: 'BCA304', code: 'BCA304', name: 'Operating Systems Principles', title: 'Operating Systems Principles', type: 'Core Theory', credits: 4, facultyId: 'FAC04', room: 'Room 304' },
      { id: 'BCA305L', code: 'BCA305L', name: 'DBMS & Java Programming Lab', title: 'DBMS & Java Programming Lab', type: 'Laboratory', credits: 2, facultyId: 'FAC02', room: 'Database Lab' }
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

export const INITIAL_TIMETABLE_ENTRIES = [
  // Semester 3 Schedule
  // Monday
  { id: 'tt-301', semesterId: '3', courseId: 'BCA301', courseCode: 'BCA301', courseName: 'Relational Database Management Systems', facultyId: 'FAC01', facultyName: 'Dr. A. Sharma', dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:00', room: 'Room 301', sessionType: 'THEORY', status: 'SCHEDULED' },
  { id: 'tt-302', semesterId: '3', courseId: 'BCA302', courseCode: 'BCA302', courseName: 'Java Programming & OOP Concepts', facultyId: 'FAC02', facultyName: 'Prof. K. Rao', dayOfWeek: 'MONDAY', startTime: '10:00', endTime: '11:00', room: 'Room 302', sessionType: 'THEORY', status: 'SCHEDULED' },
  { id: 'tt-303', semesterId: '3', courseId: 'BCA303', courseCode: 'BCA303', courseName: 'Computer Networks & Architecture', facultyId: 'FAC03', facultyName: 'Prof. M. Varma', dayOfWeek: 'MONDAY', startTime: '11:15', endTime: '12:15', room: 'Room 303', sessionType: 'THEORY', status: 'SCHEDULED' },
  { id: 'tt-304', semesterId: '3', courseId: 'BCA305L', courseCode: 'BCA305L', courseName: 'DBMS & Java Programming Lab', facultyId: 'FAC02', facultyName: 'Prof. K. Rao', dayOfWeek: 'MONDAY', startTime: '01:15', endTime: '03:15', room: 'Database Lab', sessionType: 'LAB', status: 'SCHEDULED', notice: 'Bring completed SQL practical record notebooks' },
  
  // Tuesday
  { id: 'tt-305', semesterId: '3', courseId: 'BCA302', courseCode: 'BCA302', courseName: 'Java Programming & OOP Concepts', facultyId: 'FAC02', facultyName: 'Prof. K. Rao', dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '10:00', room: 'Room 302', sessionType: 'THEORY', status: 'SCHEDULED' },
  { id: 'tt-306', semesterId: '3', courseId: 'BCA304', courseCode: 'BCA304', courseName: 'Operating Systems Principles', facultyId: 'FAC04', facultyName: 'Dr. S. Nair', dayOfWeek: 'TUESDAY', startTime: '10:00', endTime: '11:00', room: 'Room 304', sessionType: 'THEORY', status: 'SUBSTITUTED', substituteFacultyId: 'FAC03', substituteFacultyName: 'Prof. M. Varma', notice: 'Guest session by Prof. M. Varma on Process Synchronization' },
  { id: 'tt-307', semesterId: '3', courseId: 'BCA301', courseCode: 'BCA301', courseName: 'Relational Database Management Systems', facultyId: 'FAC01', facultyName: 'Dr. A. Sharma', dayOfWeek: 'TUESDAY', startTime: '11:15', endTime: '12:15', room: 'Room 301', sessionType: 'THEORY', status: 'SCHEDULED' },
  { id: 'tt-308', semesterId: '3', courseId: 'BCA300', courseCode: 'SEM-301', courseName: 'Technical Seminar & Library', facultyId: 'FAC05', facultyName: 'Prof. R. Deshmukh', dayOfWeek: 'TUESDAY', startTime: '01:15', endTime: '02:15', room: 'Seminar Hall', sessionType: 'SEMINAR', status: 'SCHEDULED' },
  
  // Wednesday
  { id: 'tt-309', semesterId: '3', courseId: 'BCA303', courseCode: 'BCA303', courseName: 'Computer Networks & Architecture', facultyId: 'FAC03', facultyName: 'Prof. M. Varma', dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '10:00', room: 'Room 303', sessionType: 'THEORY', status: 'SCHEDULED' },
  { id: 'tt-310', semesterId: '3', courseId: 'BCA301', courseCode: 'BCA301', courseName: 'Relational Database Management Systems', facultyId: 'FAC01', facultyName: 'Dr. A. Sharma', dayOfWeek: 'WEDNESDAY', startTime: '10:00', endTime: '11:00', room: 'Room 301', sessionType: 'THEORY', status: 'SCHEDULED' },
  { id: 'tt-311', semesterId: '3', courseId: 'BCA304', courseCode: 'BCA304', courseName: 'Operating Systems Principles', facultyId: 'FAC04', facultyName: 'Dr. S. Nair', dayOfWeek: 'WEDNESDAY', startTime: '11:15', endTime: '12:15', room: 'Room 304', sessionType: 'THEORY', status: 'SCHEDULED' },
  { id: 'tt-312', semesterId: '3', courseId: 'BCA302', courseCode: 'BCA302', courseName: 'Java Programming & OOP Concepts', facultyId: 'FAC02', facultyName: 'Prof. K. Rao', dayOfWeek: 'WEDNESDAY', startTime: '01:15', endTime: '02:15', room: 'Room 302', sessionType: 'THEORY', status: 'SCHEDULED' },
  
  // Thursday
  { id: 'tt-313', semesterId: '3', courseId: 'BCA304', courseCode: 'BCA304', courseName: 'Operating Systems Principles', facultyId: 'FAC04', facultyName: 'Dr. S. Nair', dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '10:00', room: 'Room 304', sessionType: 'THEORY', status: 'SCHEDULED' },
  { id: 'tt-314', semesterId: '3', courseId: 'BCA303', courseCode: 'BCA303', courseName: 'Computer Networks & Architecture', facultyId: 'FAC03', facultyName: 'Prof. M. Varma', dayOfWeek: 'THURSDAY', startTime: '10:00', endTime: '11:00', room: 'Room 303', sessionType: 'THEORY', status: 'SCHEDULED' },
  { id: 'tt-315', semesterId: '3', courseId: 'BCA302', courseCode: 'BCA302', courseName: 'Java Programming & OOP Concepts', facultyId: 'FAC02', facultyName: 'Prof. K. Rao', dayOfWeek: 'THURSDAY', startTime: '11:15', endTime: '12:15', room: 'Room 302', sessionType: 'THEORY', status: 'SCHEDULED' },
  { id: 'tt-316', semesterId: '3', courseId: 'BCA305L', courseCode: 'BCA305L', courseName: 'DBMS & Java Programming Lab', facultyId: 'FAC01', facultyName: 'Dr. A. Sharma', dayOfWeek: 'THURSDAY', startTime: '01:15', endTime: '03:15', room: 'Java Lab', sessionType: 'LAB', status: 'SCHEDULED', notice: 'Inheritance & Interface practical evaluation today' },
  
  // Friday
  { id: 'tt-317', semesterId: '3', courseId: 'BCA301', courseCode: 'BCA301', courseName: 'Relational Database Management Systems', facultyId: 'FAC01', facultyName: 'Dr. A. Sharma', dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '10:00', room: 'Room 301', sessionType: 'THEORY', status: 'SCHEDULED' },
  { id: 'tt-318', semesterId: '3', courseId: 'BCA304', courseCode: 'BCA304', courseName: 'Operating Systems Principles', facultyId: 'FAC04', facultyName: 'Dr. S. Nair', dayOfWeek: 'FRIDAY', startTime: '10:00', endTime: '11:00', room: 'Room 304', sessionType: 'THEORY', status: 'SCHEDULED' },
  { id: 'tt-319', semesterId: '3', courseId: 'BCA303', courseCode: 'BCA303', courseName: 'Computer Networks & Architecture', facultyId: 'FAC03', facultyName: 'Prof. M. Varma', dayOfWeek: 'FRIDAY', startTime: '11:15', endTime: '12:15', room: 'Room 303', sessionType: 'THEORY', status: 'CANCELLED', notice: 'Class cancelled due to Faculty Department Meeting. Compensation on Sat.' },
  { id: 'tt-320', semesterId: '3', courseId: 'BCA300', courseCode: 'CRT-301', courseName: 'Campus Placement & Aptitude Training', facultyId: 'FAC05', facultyName: 'Prof. R. Deshmukh', dayOfWeek: 'FRIDAY', startTime: '01:15', endTime: '03:15', room: 'Auditorium 2', sessionType: 'PRACTICAL', status: 'SCHEDULED' },

  // Saturday
  { id: 'tt-321', semesterId: '3', courseId: 'BCA303', courseCode: 'BCA303', courseName: 'Computer Networks & Architecture', facultyId: 'FAC03', facultyName: 'Prof. M. Varma', dayOfWeek: 'SATURDAY', startTime: '09:30', endTime: '11:30', room: 'Room 303', sessionType: 'THEORY', status: 'SCHEDULED', notice: 'Compensatory class for Friday session' }
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann-101',
    title: 'CIA-2 Examination Schedule & Portions Published',
    content: 'Continuous Internal Assessment 2 (CIA-2) will commence from September 10, 2026. Students must ensure strict attendance compliance of 75% or higher to be allotted hall tickets.',
    authorId: 'FAC01',
    authorName: 'Dr. A. Sharma (HOD)',
    audienceType: 'SEMESTER',
    semesterId: '3',
    priority: 'URGENT',
    attachments: [
      { name: 'CIA2_Timetable_Portions_Sem3.pdf', size: '1.2 MB', url: '#' }
    ],
    publishedAt: '2026-08-22T09:30:00Z',
    expiresAt: '2026-09-15T23:59:59Z',
    isRead: false
  },
  {
    id: 'ann-102',
    title: 'Oracle Database Certification Workshop — Registration Open',
    content: 'The Department of Computer Applications is organizing a 3-day hands-on workshop on Oracle PL/SQL & Cloud Autonomous Database. 20 OD credits available for participants.',
    authorId: 'FAC01',
    authorName: 'Dr. A. Sharma',
    audienceType: 'DEPARTMENT',
    courseId: 'BCA301',
    priority: 'IMPORTANT',
    attachments: [
      { name: 'Oracle_Workshop_Brochure.pdf', size: '2.4 MB', url: '#' }
    ],
    publishedAt: '2026-08-20T11:00:00Z',
    expiresAt: '2026-09-01T18:00:00Z',
    isRead: true
  },
  {
    id: 'ann-103',
    title: 'Submission of Smart India Hackathon (SIH 2026) Ideas',
    content: 'Teams planning to submit project proposals for SIH 2026 must upload their synopsis to the Activity/OD portal and get internal mentoring approval by Aug 28.',
    authorId: 'FAC02',
    authorName: 'Prof. K. Rao',
    audienceType: 'COLLEGE',
    priority: 'NORMAL',
    attachments: [],
    publishedAt: '2026-08-18T14:15:00Z',
    expiresAt: '2026-08-30T17:00:00Z',
    isRead: true
  },
  {
    id: 'ann-104',
    title: 'Operating Systems Lab Rescheduling for Section A',
    content: 'Due to network maintenance in Lab 2, Tuesday practical sessions will be moved to Thursday 01:15 PM in Java Lab.',
    authorId: 'FAC04',
    authorName: 'Dr. S. Nair',
    audienceType: 'COURSE',
    courseId: 'BCA304',
    priority: 'NORMAL',
    attachments: [],
    publishedAt: '2026-08-15T16:00:00Z',
    expiresAt: '2026-08-25T18:00:00Z',
    isRead: true
  }
];

export const INITIAL_ASSIGNMENTS = [
  {
    id: 'asg-301',
    courseId: 'BCA301',
    courseCode: 'BCA301',
    courseName: 'Relational Database Management Systems',
    title: 'Assignment 2: Complex SQL Queries & Relational Algebra Normalization',
    description: 'Design 3NF / BCNF normalized schema for Hospital Management and execute 10 multi-table nested SQL queries.',
    instructions: '1. Include schema diagrams. 2. Provide execution screenshots with timing. 3. Submit PDF with zipped .sql script.',
    maxMarks: 20,
    assignedAt: '2026-08-15T10:00:00Z',
    dueAt: '2026-08-28T23:59:59Z',
    allowLateSubmission: true,
    allowResubmission: true,
    attachments: ['Assignment_2_Problem_Statement.pdf'],
    createdBy: 'Dr. A. Sharma'
  },
  {
    id: 'asg-302',
    courseId: 'BCA302',
    courseCode: 'BCA302',
    courseName: 'Java Programming & OOP Concepts',
    title: 'Mini Project: Multithreaded Banking Simulation in Java',
    description: 'Implement producer-consumer pattern, deadlock prevention, and synchronized account balance transfers.',
    instructions: 'Follow standard Java coding guidelines. Document exception handling test cases.',
    maxMarks: 25,
    assignedAt: '2026-08-10T09:00:00Z',
    dueAt: '2026-08-26T23:59:59Z',
    allowLateSubmission: false,
    allowResubmission: true,
    attachments: ['Java_Multithreading_Specs.pdf'],
    createdBy: 'Prof. K. Rao'
  },
  {
    id: 'asg-303',
    courseId: 'BCA303',
    courseCode: 'BCA303',
    courseName: 'Computer Networks & Architecture',
    title: 'Assignment 1: Packet Sniffing & Subnetting Analysis using Wireshark',
    description: 'Analyze TCP 3-way handshake, DNS query-response latency, and construct Classless Inter-Domain Routing (CIDR) subnet chart.',
    instructions: 'Attach pcapng trace file or export screenshot proofs for 5 distinct protocol headers.',
    maxMarks: 15,
    assignedAt: '2026-08-01T10:00:00Z',
    dueAt: '2026-08-18T23:59:59Z',
    allowLateSubmission: true,
    allowResubmission: false,
    attachments: ['Wireshark_Lab_Guide.pdf'],
    createdBy: 'Prof. M. Varma'
  },
  {
    id: 'asg-304',
    courseId: 'BCA304',
    courseCode: 'BCA304',
    courseName: 'Operating Systems Principles',
    title: 'Assignment 2: CPU Scheduling Algorithms Simulation (FCFS, SJF, RR)',
    description: 'Simulate preemptive Priority and Round Robin scheduling in C/Python. Calculate average turnaround and waiting time.',
    instructions: 'Include Gantt chart generation outputs and compare throughput across varied time quanta.',
    maxMarks: 20,
    assignedAt: '2026-08-18T11:00:00Z',
    dueAt: '2026-09-02T23:59:59Z',
    allowLateSubmission: true,
    allowResubmission: true,
    attachments: ['OS_CPU_Scheduling_Questions.pdf'],
    createdBy: 'Dr. S. Nair'
  }
];

export const INITIAL_SUBMISSIONS = [
  {
    id: 'sub-303',
    assignmentId: 'asg-303',
    studentId: 'student-s3-001',
    studentName: 'Rahul Kumar',
    submissionText: 'Completed Wireshark packet capture analysis on TCP handshake and subnet calculations attached.',
    submissionLinks: ['https://github.com/rahulkumar-bca/wireshark-tcp-lab'],
    uploadedFiles: ['Rahul_Kumar_Wireshark_Report.pdf', 'handshake_capture.pcapng'],
    submittedAt: '2026-08-17T18:40:00Z',
    status: 'GRADED',
    marksObtained: 14,
    feedback: 'Excellent Wireshark protocol dissection and neat CIDR subnetting calculations. Well done!'
  }
];

export const INITIAL_COURSE_MATERIALS = [
  // BCA301 RDBMS
  {
    id: 'mat-101',
    courseId: 'BCA301',
    courseCode: 'BCA301',
    courseName: 'Relational Database Management Systems',
    title: 'Unit 1: ER-Modeling, Relational Schema & Relational Algebra Notes',
    description: 'Comprehensive notes covering entities, relationships, keys, mapping constraints, and algebraic operators.',
    materialType: 'PDF',
    unitNumber: 1,
    url: '#',
    fileSize: '3.4 MB',
    uploadedBy: 'Dr. A. Sharma',
    publishedAt: '2026-08-01T10:00:00Z',
    isVisible: true,
    isBookmarked: true
  },
  {
    id: 'mat-102',
    courseId: 'BCA301',
    courseCode: 'BCA301',
    courseName: 'Relational Database Management Systems',
    title: 'Unit 2: Normalization (1NF, 2NF, 3NF, BCNF, 4NF) Slides',
    description: 'Lecture presentation slides on functional dependencies, loss-less decomposition, and dependency preservation.',
    materialType: 'PPT',
    unitNumber: 2,
    url: '#',
    fileSize: '5.8 MB',
    uploadedBy: 'Dr. A. Sharma',
    publishedAt: '2026-08-08T11:30:00Z',
    isVisible: true,
    isBookmarked: false
  },
  {
    id: 'mat-103',
    courseId: 'BCA301',
    courseCode: 'BCA301',
    courseName: 'Relational Database Management Systems',
    title: 'Unit 3: SQL Triggers, Stored Procedures & Transaction ACID Properties',
    description: 'Code snippets, syntax examples, concurrency anomalies (dirty read, phantom read), and locking protocols.',
    materialType: 'DOCUMENT',
    unitNumber: 3,
    url: '#',
    fileSize: '1.9 MB',
    uploadedBy: 'Dr. A. Sharma',
    publishedAt: '2026-08-16T14:00:00Z',
    isVisible: true,
    isBookmarked: true
  },
  {
    id: 'mat-104',
    courseId: 'BCA301',
    courseCode: 'BCA301',
    courseName: 'Relational Database Management Systems',
    title: 'Database System Concepts (7th Edition) — Silberschatz Reference Book',
    description: 'Standard textbook reference for relational query optimization and indexing techniques (B+ Trees).',
    materialType: 'REFERENCE',
    unitNumber: 4,
    url: '#',
    fileSize: '14.2 MB',
    uploadedBy: 'Dr. A. Sharma',
    publishedAt: '2026-08-02T09:00:00Z',
    isVisible: true,
    isBookmarked: false
  },
  
  // BCA302 Java
  {
    id: 'mat-201',
    courseId: 'BCA302',
    courseCode: 'BCA302',
    courseName: 'Java Programming & OOP Concepts',
    title: 'Unit 1: Core Java OOP, Inheritance & Polymorphism Guide',
    description: 'In-depth notes on method overloading, overriding, super, final, and abstract classes.',
    materialType: 'PDF',
    unitNumber: 1,
    url: '#',
    fileSize: '2.8 MB',
    uploadedBy: 'Prof. K. Rao',
    publishedAt: '2026-08-03T10:00:00Z',
    isVisible: true,
    isBookmarked: true
  },
  {
    id: 'mat-202',
    courseId: 'BCA302',
    courseCode: 'BCA302',
    courseName: 'Java Programming & OOP Concepts',
    title: 'Unit 2: Multithreading & Exception Handling Video Lecture',
    description: 'Recorded classroom session on thread lifecycle, synchronization locks, and custom exceptions.',
    materialType: 'VIDEO',
    unitNumber: 2,
    url: 'https://youtube.com/example-java-multithread',
    fileSize: '45 mins stream',
    uploadedBy: 'Prof. K. Rao',
    publishedAt: '2026-08-12T15:30:00Z',
    isVisible: true,
    isBookmarked: false
  },
  {
    id: 'mat-203',
    courseId: 'BCA302',
    courseCode: 'BCA302',
    courseName: 'Java Programming & OOP Concepts',
    title: 'Unit 3: Java Collections Framework & Generics Cheat Sheet',
    description: 'ArrayList, LinkedList, HashMap, TreeSet complexities and stream API lambda expressions.',
    materialType: 'LINK',
    unitNumber: 3,
    url: 'https://docs.oracle.com/en/java/javase/17/docs/api/',
    fileSize: 'Web Link',
    uploadedBy: 'Prof. K. Rao',
    publishedAt: '2026-08-18T10:00:00Z',
    isVisible: true,
    isBookmarked: false
  },

  // BCA304 OS
  {
    id: 'mat-401',
    courseId: 'BCA304',
    courseCode: 'BCA304',
    courseName: 'Operating Systems Principles',
    title: 'Unit 2: CPU Scheduling & Process Synchronization Algorithms',
    description: 'Peterson solution, Semaphores, Mutex, Classical IPC problems (Dining Philosophers, Readers-Writers).',
    materialType: 'PDF',
    unitNumber: 2,
    url: '#',
    fileSize: '4.1 MB',
    uploadedBy: 'Dr. S. Nair',
    publishedAt: '2026-08-14T09:15:00Z',
    isVisible: true,
    isBookmarked: true
  }
];

export const INITIAL_DETAILED_ATTENDANCE = {
  summary: [
    {
      courseId: 'BCA301',
      courseCode: 'BCA301',
      courseName: 'Relational Database Management Systems',
      totalClasses: 28,
      attendedClasses: 26,
      absentClasses: 2,
      odClasses: 2,
      leaveClasses: 0,
      attendancePercentage: 93,
      thresholdPercentage: 75,
      shortageRisk: false,
      requiredFutureClasses: 0
    },
    {
      courseId: 'BCA302',
      courseCode: 'BCA302',
      courseName: 'Java Programming & OOP Concepts',
      totalClasses: 28,
      attendedClasses: 25,
      absentClasses: 3,
      odClasses: 1,
      leaveClasses: 0,
      attendancePercentage: 89,
      thresholdPercentage: 75,
      shortageRisk: false,
      requiredFutureClasses: 0
    },
    {
      courseId: 'BCA303',
      courseCode: 'BCA303',
      courseName: 'Computer Networks & Architecture',
      totalClasses: 26,
      attendedClasses: 23,
      absentClasses: 3,
      odClasses: 1,
      leaveClasses: 0,
      attendancePercentage: 88,
      thresholdPercentage: 75,
      shortageRisk: false,
      requiredFutureClasses: 0
    },
    {
      courseId: 'BCA304',
      courseCode: 'BCA304',
      courseName: 'Operating Systems Principles',
      totalClasses: 25,
      attendedClasses: 18,
      absentClasses: 7,
      odClasses: 0,
      leaveClasses: 0,
      attendancePercentage: 72,
      thresholdPercentage: 75,
      shortageRisk: true,
      requiredFutureClasses: 3 // Needs 3 consecutive present classes to reach 75%
    },
    {
      courseId: 'BCA305L',
      courseCode: 'BCA305L',
      courseName: 'DBMS & Java Programming Lab',
      totalClasses: 12,
      attendedClasses: 12,
      absentClasses: 0,
      odClasses: 0,
      leaveClasses: 0,
      attendancePercentage: 100,
      thresholdPercentage: 75,
      shortageRisk: false,
      requiredFutureClasses: 0
    }
  ],
  records: [
    { id: 'att-1', date: '2026-08-22', period: 1, courseCode: 'BCA301', courseName: 'RDBMS', status: 'PRESENT', markedBy: 'Dr. A. Sharma' },
    { id: 'att-2', date: '2026-08-22', period: 2, courseCode: 'BCA304', courseName: 'Operating Systems', status: 'ABSENT', markedBy: 'Dr. S. Nair', remarks: 'Late entry after 10 mins' },
    { id: 'att-3', date: '2026-08-21', period: 1, courseCode: 'BCA302', courseName: 'Java Programming', status: 'PRESENT', markedBy: 'Prof. K. Rao' },
    { id: 'att-4', date: '2026-08-21', period: 3, courseCode: 'BCA303', courseName: 'Computer Networks', status: 'PRESENT', markedBy: 'Prof. M. Varma' },
    { id: 'att-5', date: '2026-08-20', period: 1, courseCode: 'BCA304', courseName: 'Operating Systems', status: 'ABSENT', markedBy: 'Dr. S. Nair' },
    { id: 'att-6', date: '2026-08-19', period: 4, courseCode: 'BCA305L', courseName: 'DBMS Lab', status: 'PRESENT', markedBy: 'Prof. K. Rao' },
    { id: 'att-7', date: '2026-08-18', period: 2, courseCode: 'BCA301', courseName: 'RDBMS', status: 'OD', markedBy: 'Dr. A. Sharma', remarks: 'Approved for SIH Hackathon' },
    { id: 'att-8', date: '2026-08-18', period: 3, courseCode: 'BCA302', courseName: 'Java Programming', status: 'OD', markedBy: 'Prof. K. Rao', remarks: 'Approved for SIH Hackathon' }
  ],
  correctionRequests: [
    {
      id: 'cr-101',
      studentId: 'student-s3-001',
      courseCode: 'BCA304',
      date: '2026-08-22',
      period: 2,
      reason: 'Biometric fingerprint machine timed out at 09:58 AM; faculty entered absence.',
      status: 'UNDER_REVIEW',
      submittedAt: '2026-08-22T14:30:00Z',
      facultyRemarks: 'Verifying with lab security log'
    }
  ]
};

export const INITIAL_ASSESSMENT_MARKS = [
  {
    courseCode: 'BCA301',
    courseName: 'Relational Database Management Systems',
    facultyName: 'Dr. A. Sharma',
    credits: 4,
    components: [
      { id: 'm-1', type: 'IA1', title: 'Internal Assessment 1 (Units 1 & 2)', marksObtained: 46, maxMarks: 50, weightage: 20, status: 'PUBLISHED', feedback: 'Very strong relational schema normalization proofs.' },
      { id: 'm-2', type: 'IA2', title: 'Internal Assessment 2 (Units 3 & 4)', marksObtained: 44, maxMarks: 50, weightage: 20, status: 'PUBLISHED', feedback: 'Good query optimization.' },
      { id: 'm-3', type: 'ASSIGNMENT', title: 'Continuous Assignments (2 Total)', marksObtained: 19, maxMarks: 20, weightage: 10, status: 'PUBLISHED', feedback: 'Comprehensive SQL documentation.' },
      { id: 'm-4', type: 'QUIZ', title: 'Online MCQs on SQL & ACID', marksObtained: 18, maxMarks: 20, weightage: 10, status: 'PUBLISHED', feedback: 'High accuracy in transaction locks.' },
      { id: 'm-5', type: 'EXAM', title: 'Semester End University Examination', marksObtained: null, maxMarks: 100, weightage: 50, status: 'DRAFT', feedback: 'Scheduled for December 2026' }
    ],
    internalTotal: 47, // out of 50
    estimatedGrade: 'O (Outstanding)'
  },
  {
    courseCode: 'BCA302',
    courseName: 'Java Programming & OOP Concepts',
    facultyName: 'Prof. K. Rao',
    credits: 4,
    components: [
      { id: 'm-6', type: 'IA1', title: 'Internal Assessment 1 (OOP & Collections)', marksObtained: 45, maxMarks: 50, weightage: 20, status: 'PUBLISHED', feedback: 'Clean class architecture.' },
      { id: 'm-7', type: 'IA2', title: 'Internal Assessment 2 (Multithreading & Streams)', marksObtained: 43, maxMarks: 50, weightage: 20, status: 'PUBLISHED', feedback: 'Handled race condition scenarios well.' },
      { id: 'm-8', type: 'ASSIGNMENT', title: 'Mini Project Coding Evaluation', marksObtained: 23, maxMarks: 25, weightage: 15, status: 'PUBLISHED', feedback: 'Working GUI + socket communication.' },
      { id: 'm-9', type: 'EXAM', title: 'Semester End University Examination', marksObtained: null, maxMarks: 100, weightage: 50, status: 'DRAFT', feedback: 'Scheduled for December 2026' }
    ],
    internalTotal: 46,
    estimatedGrade: 'A+ (Excellent)'
  },
  {
    courseCode: 'BCA303',
    courseName: 'Computer Networks & Architecture',
    facultyName: 'Prof. M. Varma',
    credits: 4,
    components: [
      { id: 'm-10', type: 'IA1', title: 'Internal Assessment 1 (OSI / TCP-IP & IP Subnets)', marksObtained: 42, maxMarks: 50, weightage: 20, status: 'PUBLISHED', feedback: 'Solid understanding of routing protocols.' },
      { id: 'm-11', type: 'IA2', title: 'Internal Assessment 2 (Transport & Security)', marksObtained: 41, maxMarks: 50, weightage: 20, status: 'PUBLISHED', feedback: 'Minor error in TLS handshake diagram.' },
      { id: 'm-12', type: 'ASSIGNMENT', title: 'Wireshark Packet Analysis', marksObtained: 14, maxMarks: 15, weightage: 10, status: 'PUBLISHED', feedback: 'Excellent packet dissection.' },
      { id: 'm-13', type: 'EXAM', title: 'Semester End University Examination', marksObtained: null, maxMarks: 100, weightage: 50, status: 'DRAFT', feedback: 'Scheduled for December 2026' }
    ],
    internalTotal: 44,
    estimatedGrade: 'A+ (Excellent)'
  },
  {
    courseCode: 'BCA304',
    courseName: 'Operating Systems Principles',
    facultyName: 'Dr. S. Nair',
    credits: 4,
    components: [
      { id: 'm-14', type: 'IA1', title: 'Internal Assessment 1 (Process & Scheduling)', marksObtained: 40, maxMarks: 50, weightage: 20, status: 'PUBLISHED', feedback: 'Good numericals on Round Robin.' },
      { id: 'm-15', type: 'IA2', title: 'Internal Assessment 2 (Memory & Deadlocks)', marksObtained: 42, maxMarks: 50, weightage: 20, status: 'PUBLISHED', feedback: 'Accurate Bankers algorithm execution.' },
      { id: 'm-16', type: 'ASSIGNMENT', title: 'Algorithm Simulation Code', marksObtained: 18, maxMarks: 20, weightage: 10, status: 'PUBLISHED', feedback: 'Neat modular structure.' },
      { id: 'm-17', type: 'EXAM', title: 'Semester End University Examination', marksObtained: null, maxMarks: 100, weightage: 50, status: 'DRAFT', feedback: 'Scheduled for December 2026' }
    ],
    internalTotal: 43,
    estimatedGrade: 'A (Very Good)'
  },
  {
    courseCode: 'BCA305L',
    courseName: 'DBMS & Java Programming Lab',
    facultyName: 'Prof. K. Rao & Dr. A. Sharma',
    credits: 2,
    components: [
      { id: 'm-18', type: 'LAB', title: 'Continuous Practical Record & Execution', marksObtained: 28, maxMarks: 30, weightage: 30, status: 'PUBLISHED', feedback: 'All 12 lab exercises verified.' },
      { id: 'm-19', type: 'LAB', title: 'Model Lab Practical Exam', marksObtained: 19, maxMarks: 20, weightage: 20, status: 'PUBLISHED', feedback: 'Passed all unit test suites.' }
    ],
    internalTotal: 47,
    estimatedGrade: 'O (Outstanding)'
  }
];

export const INITIAL_EXAM_RESULTS = {
  history: [
    {
      semester: 1,
      term: '2024-25 ODD',
      sgpa: 9.05,
      totalCredits: 20,
      creditsEarned: 20,
      resultStatus: 'PASS',
      remarks: 'First Class with Distinction',
      publishedAt: '2025-01-15',
      subjects: [
        { code: 'BCA101', name: 'Programming Fundamentals in C', credits: 4, internal: 46, external: 48, total: 94, grade: 'O', gradePoint: 10, result: 'PASS' },
        { code: 'BCA102', name: 'Discrete Mathematics', credits: 4, internal: 44, external: 45, total: 89, grade: 'A+', gradePoint: 9, result: 'PASS' },
        { code: 'BCA103', name: 'Digital Logic & Computer Design', credits: 4, internal: 42, external: 43, total: 85, grade: 'A+', gradePoint: 9, result: 'PASS' },
        { code: 'BCA104', name: 'Professional Communication', credits: 3, internal: 47, external: 46, total: 93, grade: 'O', gradePoint: 10, result: 'PASS' },
        { code: 'BCA105L', name: 'C Programming Laboratory', credits: 2, internal: 48, external: 49, total: 97, grade: 'O', gradePoint: 10, result: 'PASS' }
      ]
    },
    {
      semester: 2,
      term: '2024-25 EVEN',
      sgpa: 8.80,
      totalCredits: 20,
      creditsEarned: 20,
      resultStatus: 'PASS',
      remarks: 'First Class with Distinction',
      publishedAt: '2025-06-20',
      subjects: [
        { code: 'BCA201', name: 'Data Structures with C++', credits: 4, internal: 43, external: 45, total: 88, grade: 'A+', gradePoint: 9, result: 'PASS' },
        { code: 'BCA202', name: 'Object Oriented Programming', credits: 4, internal: 45, external: 46, total: 91, grade: 'O', gradePoint: 10, result: 'PASS' },
        { code: 'BCA203', name: 'Financial Accounting & Management', credits: 3, internal: 41, external: 42, total: 83, grade: 'A', gradePoint: 8, result: 'PASS' },
        { code: 'BCA204', name: 'Environmental Science', credits: 3, internal: 44, external: 44, total: 88, grade: 'A+', gradePoint: 9, result: 'PASS' },
        { code: 'BCA205L', name: 'Data Structures Lab', credits: 2, internal: 47, external: 48, total: 95, grade: 'O', gradePoint: 10, result: 'PASS' }
      ]
    },
    {
      semester: 3,
      term: '2025-26 ODD (Interim Provisional)',
      sgpa: 8.85,
      totalCredits: 22,
      creditsEarned: 22,
      resultStatus: 'PASS',
      remarks: 'Provisional CIA Aggregate',
      publishedAt: '2026-08-20',
      subjects: [
        { code: 'BCA301', name: 'Relational Database Management Systems', credits: 4, internal: 47, external: 46, total: 93, grade: 'O', gradePoint: 10, result: 'PASS' },
        { code: 'BCA302', name: 'Java Programming & OOP Concepts', credits: 4, internal: 46, external: 44, total: 90, grade: 'O', gradePoint: 10, result: 'PASS' },
        { code: 'BCA303', name: 'Computer Networks & Architecture', credits: 4, internal: 44, external: 43, total: 87, grade: 'A+', gradePoint: 9, result: 'PASS' },
        { code: 'BCA304', name: 'Operating Systems Principles', credits: 4, internal: 43, external: 41, total: 84, grade: 'A', gradePoint: 8, result: 'PASS' },
        { code: 'BCA305L', name: 'DBMS & Java Programming Lab', credits: 2, internal: 47, external: 48, total: 95, grade: 'O', gradePoint: 10, result: 'PASS' }
      ]
    }
  ],
  cgpa: 8.92,
  totalCreditsEarned: 62,
  arrearCount: 0
};

export const INITIAL_HELPDESK_TICKETS = [
  {
    id: 'TICK-4091',
    studentId: 'student-s3-001',
    studentName: 'Rahul Kumar',
    reg: 'BCS23CA001',
    category: 'Attendance correction',
    subject: 'Biometric missed check-in on 22 Aug (OS Class)',
    description: 'My biometric scan failed due to scanner glitch on 22nd Aug period 2. Kindly verify with the professor and update the attendance ledger.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: '2026-08-22T14:35:00Z',
    resolutionDeadline: '2026-08-25T17:00:00Z',
    attachments: ['scanner_error_screen.jpg'],
    replies: [
      {
        id: 'rep-1',
        author: 'Rahul Kumar',
        role: 'STUDENT',
        message: 'I have also informed Dr. S. Nair during the afternoon practical slot.',
        timestamp: '2026-08-22T14:36:00Z'
      },
      {
        id: 'rep-2',
        author: 'Dr. A. Sharma',
        role: 'HOD',
        message: 'Noted. The department coordinator is reconciling server attendance logs with CCTV entry. Expect resolution by Monday morning.',
        timestamp: '2026-08-22T16:10:00Z'
      }
    ]
  },
  {
    id: 'TICK-3882',
    studentId: 'student-s3-001',
    studentName: 'Rahul Kumar',
    reg: 'BCS23CA001',
    category: 'Certificate/document request',
    subject: 'Request for Bonafide Certificate for National Scholarship',
    description: 'Need an official signed Bonafide Certificate mentioning BCA Semester 3 enrolment for NSP scholarship renewal.',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: '2026-08-10T11:00:00Z',
    resolutionDeadline: '2026-08-14T17:00:00Z',
    attachments: ['scholarship_form.pdf'],
    replies: [
      {
        id: 'rep-3',
        author: 'Admin Office',
        role: 'ADMIN',
        message: 'Your bonafide certificate has been verified and digitally stamped. You can download the PDF from your Profile & Documents tab.',
        timestamp: '2026-08-12T10:30:00Z'
      }
    ]
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'New Announcement',
    message: 'CIA-2 Examination Schedule & Portions Published for Semester 3.',
    type: 'ANNOUNCEMENT',
    timestamp: '2026-08-22T09:30:00Z',
    isRead: false,
    link: '/student/announcements'
  },
  {
    id: 'notif-2',
    title: 'Attendance Shortage Risk Alert',
    message: 'Your attendance in BCA304 (Operating Systems) is 72% (< 75%). Attend next 3 classes to recover eligibility.',
    type: 'ATTENDANCE',
    timestamp: '2026-08-22T10:15:00Z',
    isRead: false,
    link: '/student/attendance'
  },
  {
    id: 'notif-3',
    title: 'Assignment Graded',
    message: 'Your submission for Wireshark Packet Sniffing (BCA303) was graded 14/15.',
    type: 'ASSIGNMENT',
    timestamp: '2026-08-18T11:00:00Z',
    isRead: true,
    link: '/student/assignments'
  },
  {
    id: 'notif-4',
    title: 'Helpdesk Response',
    message: 'Dr. A. Sharma replied to ticket TICK-4091 regarding attendance reconciliation.',
    type: 'HELPDESK',
    timestamp: '2026-08-22T16:10:00Z',
    isRead: false,
    link: '/student/helpdesk'
  }
];

export const INITIAL_DOCUMENT_REQUESTS = [
  {
    id: 'DOC-901',
    studentId: 'student-s3-001',
    studentName: 'Rahul Kumar',
    type: 'Bonafide Certificate',
    purpose: 'National Scholarship Portal Renewal',
    status: 'ISSUED',
    requestedAt: '2026-08-10',
    issuedAt: '2026-08-12',
    downloadUrl: '#'
  },
  {
    id: 'DOC-902',
    studentId: 'student-s3-001',
    studentName: 'Rahul Kumar',
    type: 'Official Transcript (Sem 1 & 2)',
    purpose: 'Off-Campus Internship Application',
    status: 'IN_PROCESS',
    requestedAt: '2026-08-21',
    issuedAt: null,
    downloadUrl: null
  }
];

export const INITIAL_ACTIVITIES = [
  { id: 'ACT-101', sem: 3, studentId: 'student-s3-001', studentName: 'Rahul Kumar', reg: 'BCS23CA001', title: 'National Level Hackathon 2025', org: 'IIT Madras', location: 'Chennai', date: '2025-08-12', endDate: '2025-08-14', category: 'Hackathon', od: true, status: 'HOD_APPROVED', facultyRemarks: 'Verified participation certificate & project demo', hodRemarks: 'Approved 2 days attendance credit', attendanceCreditDays: 2, skills: 'React, PostgreSQL, REST' },
  { id: 'ACT-102', sem: 3, studentId: '301', studentName: 'Aarav Nair', reg: '1BC24001', title: 'National Level Hackathon 2025', org: 'IIT Madras', location: 'Chennai', date: '2025-08-12', endDate: '2025-08-14', category: 'Hackathon', od: true, status: 'HOD_APPROVED', facultyRemarks: 'Verified participation', hodRemarks: 'Approved', attendanceCreditDays: 2, skills: 'React, PostgreSQL, REST' },
  { id: 'ACT-103', sem: 3, studentId: '302', studentName: 'Diya Menon', reg: '1BC24002', title: 'AWS Cloud Practitioner Certification', org: 'Amazon Web Services', location: 'Online', date: '2025-07-20', endDate: '2025-07-20', category: 'Certification', od: false, status: 'HOD_APPROVED', facultyRemarks: 'Credential ID verified on AWS registry', hodRemarks: 'Acknowledged', attendanceCreditDays: 0, skills: 'Cloud Architecture, AWS' },
  { id: 'ACT-104', sem: 3, studentId: 'student-s3-001', studentName: 'Rahul Kumar', reg: 'BCS23CA001', title: 'State Level Web Dev Symposium', org: 'Anna University', location: 'Guindy, Chennai', date: '2026-09-05', endDate: '2026-09-06', category: 'Symposium', od: true, status: 'FACULTY_APPROVED', facultyRemarks: 'Paper presentation abstract approved', hodRemarks: 'Pending final OD order', attendanceCreditDays: 2, skills: 'Tailwind CSS, Node.js' }
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

// LocalStorage loaders and savers

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

const LAB_KEY = 'bcafly_lab_experiments_v3';
const SESSIONS_KEY = 'bcafly_attendance_sessions_v3';

export const INITIAL_LAB_EXPERIMENTS = [
  {
    id: 'exp-1',
    courseId: 'BCA305L',
    courseCode: 'BCA305L',
    experimentNumber: 1,
    title: 'SQL DDL and DML Table Creation & Constraint Specification',
    description: 'Implement primary key, foreign key, check, unique, and not null constraints with sample data population.',
    maxMarks: 20,
    dueDate: '2026-08-10',
    isPublished: true,
    submissions: [
      { studentId: 'student-s3-001', studentName: 'Rahul Kumar', reg: 'BCS23CA001', githubUrl: 'https://github.com/rahulkumar/bca305l-lab1', status: 'VERIFIED', observationMarks: 9, vivaMarks: 5, practicalMarks: 5, totalMarks: 19, feedback: 'Well structured SQL queries and correct schema relations.' },
      { studentId: '301', studentName: 'Aarav Nair', reg: '1BC24001', githubUrl: 'https://github.com/aaravnair/dbms-lab1', status: 'VERIFIED', observationMarks: 8, vivaMarks: 5, practicalMarks: 5, totalMarks: 18, feedback: 'Good constraints implementation.' },
      { studentId: '302', studentName: 'Diya Menon', reg: '1BC24002', githubUrl: 'https://github.com/dmenon/lab-ex1', status: 'VERIFIED', observationMarks: 10, vivaMarks: 5, practicalMarks: 5, totalMarks: 20, feedback: 'Exceptional test execution.' },
      { studentId: '303', studentName: 'Rohan Gupta', reg: '1BC24003', githubUrl: '', status: 'SUBMITTED', observationMarks: 7, vivaMarks: 3, practicalMarks: 4, totalMarks: 14, feedback: 'Pending viva re-evaluation.' }
    ]
  },
  {
    id: 'exp-2',
    courseId: 'BCA305L',
    courseCode: 'BCA305L',
    experimentNumber: 2,
    title: 'Complex Nested Subqueries, Set Operations & Views in PostgreSQL/Oracle',
    description: 'Execute multi-level correlated subqueries, union/intersect/minus, and create security views.',
    maxMarks: 20,
    dueDate: '2026-08-18',
    isPublished: true,
    submissions: [
      { studentId: 'student-s3-001', studentName: 'Rahul Kumar', reg: 'BCS23CA001', githubUrl: 'https://github.com/rahulkumar/bca305l-lab2', status: 'VERIFIED', observationMarks: 9, vivaMarks: 5, practicalMarks: 5, totalMarks: 19, feedback: 'Complex views tested with execution plan.' },
      { studentId: '301', studentName: 'Aarav Nair', reg: '1BC24001', githubUrl: 'https://github.com/aaravnair/dbms-lab2', status: 'VERIFIED', observationMarks: 8, vivaMarks: 4, practicalMarks: 5, totalMarks: 17, feedback: 'Correlated subqueries working correctly.' }
    ]
  },
  {
    id: 'exp-3',
    courseId: 'BCA305L',
    courseCode: 'BCA305L',
    experimentNumber: 3,
    title: 'Java Object-Oriented Principles: Inheritance, Abstract Classes & Interfaces',
    description: 'Construct banking account hierarchy with abstract transaction methods and interest calculators.',
    maxMarks: 20,
    dueDate: '2026-08-25',
    isPublished: true,
    submissions: [
      { studentId: 'student-s3-001', studentName: 'Rahul Kumar', reg: 'BCS23CA001', githubUrl: 'https://github.com/rahulkumar/java-oop-hierarchy', status: 'SUBMITTED', observationMarks: null, vivaMarks: null, practicalMarks: null, totalMarks: null, feedback: '' }
    ]
  },
  {
    id: 'exp-4',
    courseId: 'BCA305L',
    courseCode: 'BCA305L',
    experimentNumber: 4,
    title: 'Java Exception Handling & User-Defined Custom Business Exceptions',
    description: 'Implement multi-catch blocks, finally resource management, and InsufficientFundsException.',
    maxMarks: 20,
    dueDate: '2026-09-02',
    isPublished: true,
    submissions: []
  },
  {
    id: 'exp-5',
    courseId: 'BCA305L',
    courseCode: 'BCA305L',
    experimentNumber: 5,
    title: 'JDBC Connection & CRUD Transaction Processing with PreparedStatement',
    description: 'Connect Java front-end application with PostgreSQL database for real-time customer record updates.',
    maxMarks: 20,
    dueDate: '2026-09-12',
    isPublished: false,
    submissions: []
  }
];

export const INITIAL_ATTENDANCE_SESSIONS = [
  { id: 'sess-1', courseCode: 'BCA302', courseName: 'Java Programming & OOP Concepts', semesterId: 3, section: 'A', date: '2026-08-22', period: 1, startTime: '09:00', endTime: '10:00', status: 'LOCKED', presentCount: 8, absentCount: 1, submittedAt: '2026-08-22T10:05:00Z' },
  { id: 'sess-2', courseCode: 'BCA305L', courseName: 'DBMS & Java Programming Lab', semesterId: 3, section: 'A', date: '2026-08-21', period: 4, startTime: '01:15', endTime: '03:15', status: 'LOCKED', presentCount: 9, absentCount: 0, submittedAt: '2026-08-21T15:20:00Z' },
  { id: 'sess-3', courseCode: 'BCA302', courseName: 'Java Programming & OOP Concepts', semesterId: 3, section: 'A', date: '2026-08-20', period: 2, startTime: '10:00', endTime: '11:00', status: 'LOCKED', presentCount: 8, absentCount: 1, submittedAt: '2026-08-20T11:05:00Z' }
];

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

const RISK_CASES_KEY = 'bcafly_risk_cases_v3';
const ALLOCATIONS_KEY = 'bcafly_allocations_v3';
const BACKLOGS_KEY = 'bcafly_backlogs_v3';

export const INITIAL_STUDENT_RISK_CASES = [
  {
    id: 'risk-001',
    studentId: '103',
    reg: '1BC25003',
    studentName: 'Arjun Das',
    semesterId: 3,
    section: 'A',
    riskLevel: 'HIGH',
    attendance: 72,
    sgpa: 6.90,
    backlogCount: 1,
    riskReasons: ['Attendance below 75% threshold (72%)', '1 Standing Arrear in Discrete Mathematics', 'Low score in CIA 1 Theory'],
    assignedMentorId: 'FAC02',
    mentorName: 'Prof. K. Rao',
    interventionPlan: 'Mandatory remedial tutorial on Tuesdays & bi-weekly parent attendance review.',
    status: 'INTERVENTION_ACTIVE',
    nextReviewDate: '2026-09-05',
    createdAt: '2026-08-15'
  },
  {
    id: 'risk-002',
    studentId: '304',
    reg: '1BC24004',
    studentName: 'Ananya Roy',
    semesterId: 3,
    section: 'B',
    riskLevel: 'MEDIUM',
    attendance: 74,
    sgpa: 7.20,
    backlogCount: 0,
    riskReasons: ['Borderline Attendance Shortage in Operating Systems (74%)'],
    assignedMentorId: 'FAC04',
    mentorName: 'Dr. S. Nair',
    interventionPlan: 'Counseling scheduled; attendance recovery roadmap drafted.',
    status: 'COUNSELING_SCHEDULED',
    nextReviewDate: '2026-09-02',
    createdAt: '2026-08-20'
  }
];

export const INITIAL_FACULTY_ALLOCATIONS = [
  { id: 'alloc-1', facultyId: 'FAC01', facultyName: 'Dr. A. Sharma', role: 'Professor & HOD', courseCode: 'BCA301', courseName: 'Relational Database Management Systems', allocationType: 'THEORY', weeklyHours: 4, status: 'ACTIVE' },
  { id: 'alloc-2', facultyId: 'FAC02', facultyName: 'Prof. K. Rao', role: 'Associate Professor', courseCode: 'BCA302', courseName: 'Java Programming & OOP Concepts', allocationType: 'THEORY', weeklyHours: 4, status: 'ACTIVE' },
  { id: 'alloc-3', facultyId: 'FAC02', facultyName: 'Prof. K. Rao', role: 'Associate Professor', courseCode: 'BCA305L', courseName: 'DBMS & Java Programming Lab', allocationType: 'LAB', weeklyHours: 3, status: 'ACTIVE' },
  { id: 'alloc-4', facultyId: 'FAC03', facultyName: 'Prof. M. Varma', role: 'Assistant Professor', courseCode: 'BCA303', courseName: 'Computer Networks & Architecture', allocationType: 'THEORY', weeklyHours: 4, status: 'ACTIVE' },
  { id: 'alloc-5', facultyId: 'FAC04', facultyName: 'Dr. S. Nair', role: 'Associate Professor', courseCode: 'BCA304', courseName: 'Operating Systems Principles', allocationType: 'THEORY', weeklyHours: 4, status: 'ACTIVE' },
  { id: 'alloc-6', facultyId: 'FAC05', facultyName: 'Prof. R. Deshmukh', role: 'Assistant Professor', courseCode: null, courseName: 'Unassigned / Available for Elective', allocationType: 'UNASSIGNED', weeklyHours: 0, status: 'UNASSIGNED' }
];

export const INITIAL_BACKLOG_RECORDS = [
  {
    id: 'bl-101',
    studentId: '103',
    reg: '1BC25003',
    studentName: 'Arjun Das',
    semesterId: 1,
    failedCourseCode: 'BCA102',
    failedCourseName: 'Discrete Mathematics',
    examSession: '2025-26 ODD Supplementary',
    attemptCount: 2,
    marksObtained: 28,
    maxMarks: 100,
    grade: 'F (Arrear)',
    mentorFacultyId: 'FAC03',
    mentorName: 'Prof. M. Varma',
    remedialPlan: '15-hour specialized problem solving sessions in Boolean algebra & Graph Theory.',
    remedialAttendancePercentage: 80,
    reExamEligibility: 'ELIGIBLE',
    status: 'IN_PROGRESS',
    nextReviewDate: '2026-09-10'
  },
  {
    id: 'bl-102',
    studentId: '203',
    reg: '1BC24003',
    studentName: 'Rohan Gupta',
    semesterId: 2,
    failedCourseCode: 'BCA202',
    failedCourseName: 'Database Management Systems Concepts',
    examSession: '2024-25 EVEN Regular',
    attemptCount: 1,
    marksObtained: 32,
    maxMarks: 100,
    grade: 'F (Arrear)',
    mentorFacultyId: 'FAC01',
    mentorName: 'Dr. A. Sharma',
    remedialPlan: 'SQL normalization clinic & relational algebra tutorials.',
    remedialAttendancePercentage: 92,
    reExamEligibility: 'ELIGIBLE',
    status: 'REMEDIATION_PLANNED',
    nextReviewDate: '2026-09-15'
  }
];

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

