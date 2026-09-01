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

const DB_KEY = "bcafly_database_v4";
const SESSION_KEY = "bcafly_session_v4";

const initialDatabase: BcaFlyDatabase = {
  students: [],
  courses: [],
  timetable: [],
  attendance: [],
  assessments: [],
  scores: []
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
