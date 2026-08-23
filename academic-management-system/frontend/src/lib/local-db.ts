export type UserRole = "admin" | "hod" | "faculty" | "student";

export type Student = {
  id: string;
  name: string;
  usn: string;
  semester: number;
  section: string;
  email?: string;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  semester: number;
  credits: number;
  facultyName?: string;
};

export type TimetableEntry = {
  id: string;
  semester: number;
  courseId: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
};

export type AttendanceRecord = {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: "present" | "absent" | "late";
};

export type Assessment = {
  id: string;
  courseId: string;
  title: string;
  maxMarks: number;
  semester: number;
};

export type AssessmentScore = {
  id: string;
  assessmentId: string;
  studentId: string;
  marksObtained: number;
};

export type StudentSession = {
  role: "student";
  studentId: string;
  studentName: string;
  usn: string;
  semester: number;
  section: string;
  loginAt: string;
};

export type StaffSession = {
  role: "admin" | "hod" | "faculty";
  username: string;
  loginAt: string;
};

export type BcaFlyDatabase = {
  students: Student[];
  courses: Course[];
  timetable: TimetableEntry[];
  attendance: AttendanceRecord[];
  assessments: Assessment[];
  scores: AssessmentScore[];
};

const DB_KEY = "bcafly_database";
const SESSION_KEY = "bcafly_session";

const initialDatabase: BcaFlyDatabase = {
  students: [
    {
      id: "student-s3-001",
      name: "Rahul Kumar",
      usn: "BCS23CA001",
      semester: 3,
      section: "A",
      email: "rahul@example.com",
    },
    {
      id: "student-s1-001",
      name: "Ananya Sharma",
      usn: "BCS24CA001",
      semester: 1,
      section: "A",
      email: "ananya@example.com",
    },
  ],
  courses: [
    { id: "c-101", code: "BCA101", title: "Programming Fundamentals in C", semester: 1, credits: 4, facultyName: "Dr. A. Sharma" },
    { id: "c-102", code: "BCA102", title: "Discrete Mathematics", semester: 1, credits: 4, facultyName: "Prof. M. Varma" },
    { id: "c-103", code: "BCA103", title: "Digital Logic & Computer Design", semester: 1, credits: 4, facultyName: "Dr. S. Nair" },
    { id: "c-104", code: "BCA104", title: "Professional Communication", semester: 1, credits: 3, facultyName: "Prof. R. Deshmukh" },
    { id: "c-105", code: "BCA105L", title: "C Programming Laboratory", semester: 1, credits: 2, facultyName: "Dr. A. Sharma" },
    { id: "c-301", code: "BCA301", title: "Relational Database Management Systems (RDBMS)", semester: 3, credits: 4, facultyName: "Dr. A. Sharma" },
    { id: "c-302", code: "BCA302", title: "Java Programming & OOP Concepts", semester: 3, credits: 4, facultyName: "Prof. K. Rao" },
    { id: "c-303", code: "BCA303", title: "Computer Networks & Architecture", semester: 3, credits: 4, facultyName: "Prof. M. Varma" },
    { id: "c-304", code: "BCA304", title: "Operating Systems Principles", semester: 3, credits: 4, facultyName: "Dr. S. Nair" },
    { id: "c-305", code: "BCA305L", title: "DBMS & Java Programming Lab", semester: 3, credits: 2, facultyName: "Prof. K. Rao" }
  ],
  timetable: [
    { id: "tt-301", semester: 3, courseId: "c-301", day: "Monday", startTime: "09:00 AM", endTime: "10:00 AM", room: "Room 301" },
    { id: "tt-302", semester: 3, courseId: "c-302", day: "Monday", startTime: "10:00 AM", endTime: "11:00 AM", room: "Room 302" },
    { id: "tt-303", semester: 3, courseId: "c-303", day: "Monday", startTime: "11:15 AM", endTime: "12:15 PM", room: "Room 303" },
    { id: "tt-304", semester: 3, courseId: "c-305", day: "Monday", startTime: "01:15 PM", endTime: "03:15 PM", room: "Database Lab" },
    { id: "tt-305", semester: 3, courseId: "c-302", day: "Tuesday", startTime: "09:00 AM", endTime: "10:00 AM", room: "Room 302" },
    { id: "tt-306", semester: 3, courseId: "c-304", day: "Tuesday", startTime: "10:00 AM", endTime: "11:00 AM", room: "Room 304" },
    { id: "tt-307", semester: 3, courseId: "c-301", day: "Tuesday", startTime: "11:15 AM", endTime: "12:15 PM", room: "Room 301" },
    { id: "tt-101", semester: 1, courseId: "c-101", day: "Monday", startTime: "09:00 AM", endTime: "10:00 AM", room: "Room 101" },
    { id: "tt-102", semester: 1, courseId: "c-102", day: "Monday", startTime: "10:00 AM", endTime: "11:00 AM", room: "Room 102" },
    { id: "tt-103", semester: 1, courseId: "c-105", day: "Monday", startTime: "01:15 PM", endTime: "03:15 PM", room: "C Programming Lab" }
  ],
  attendance: [
    { id: "att-001", studentId: "student-s3-001", courseId: "c-301", date: "2026-08-10", status: "present" },
    { id: "att-002", studentId: "student-s3-001", courseId: "c-302", date: "2026-08-10", status: "present" },
    { id: "att-003", studentId: "student-s3-001", courseId: "c-303", date: "2026-08-11", status: "present" },
    { id: "att-004", studentId: "student-s3-001", courseId: "c-304", date: "2026-08-11", status: "late" },
    { id: "att-005", studentId: "student-s1-001", courseId: "c-101", date: "2026-08-10", status: "present" },
    { id: "att-006", studentId: "student-s1-001", courseId: "c-102", date: "2026-08-10", status: "present" }
  ],
  assessments: [
    { id: "as-301", courseId: "c-301", title: "Internal Assessment 1", maxMarks: 20, semester: 3 },
    { id: "as-302", courseId: "c-302", title: "Internal Assessment 1", maxMarks: 20, semester: 3 },
    { id: "as-101", courseId: "c-101", title: "Internal Assessment 1", maxMarks: 20, semester: 1 }
  ],
  scores: [
    { id: "sc-001", assessmentId: "as-301", studentId: "student-s3-001", marksObtained: 19 },
    { id: "sc-002", assessmentId: "as-302", studentId: "student-s3-001", marksObtained: 18 },
    { id: "sc-003", assessmentId: "as-101", studentId: "student-s1-001", marksObtained: 17 }
  ],
};

export function getDatabase(): BcaFlyDatabase {
  if (typeof window === "undefined") return initialDatabase;

  const savedData = localStorage.getItem(DB_KEY);

  if (!savedData) {
    localStorage.setItem(DB_KEY, JSON.stringify(initialDatabase));
    return initialDatabase;
  }

  try {
    return JSON.parse(savedData);
  } catch {
    return initialDatabase;
  }
}

export function saveDatabase(database: BcaFlyDatabase) {
  localStorage.setItem(DB_KEY, JSON.stringify(database));
}

export function getSession(): StudentSession | StaffSession | null {
  if (typeof window === "undefined") return null;

  const savedSession = localStorage.getItem(SESSION_KEY);
  return savedSession ? JSON.parse(savedSession) : null;
}

export function saveSession(session: StudentSession | StaffSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
