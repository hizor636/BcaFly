/**
 * BcaFly Centralized API Service Layer
 *
 * All frontend pages use this service to communicate with the Spring Boot backend.
 * Each role namespace (student, faculty, hod, admin) calls only its own scoped endpoints.
 * The backend enforces authorization — the frontend never trusts client-side role checks alone.
 */
import apiClient from './apiClient';

// ── Shared helpers ──────────────────────────────────────────────
const get = (url, params) => apiClient.get(url, { params }).then(r => r.data);
const post = (url, data) => apiClient.post(url, data).then(r => r.data);
const put = (url, data) => apiClient.put(url, data).then(r => r.data);
const del = (url) => apiClient.delete(url).then(r => r.data);

const upload = (url, formData) =>
  apiClient.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);

// ── Authentication ──────────────────────────────────────────────
export const authApi = {
  login: (email, password) => post('/auth/login', { email, password }),
  register: (data) => post('/auth/register', data),
  me: () => get('/auth/me'),
};

// ── Student API (scoped to authenticated student only) ──────────
// Backend derives studentId from JWT — never sent as parameter
export const studentApi = {
  getProfile: () => get('/student/profile'),
  getEnrolments: () => get('/student/enrolments'),
  getCourses: () => get('/student/courses'),
  getTimetable: (day) => get('/student/timetable', { day }),
  getAttendance: (courseId) => get('/student/attendance', { courseId }),
  getMarks: (courseId) => get('/student/marks', { courseId }),
  getResults: (semester) => get('/student/results', { semester }),
  getAssignments: () => get('/student/assignments'),
  getMaterials: (courseId) => get('/student/materials', { courseId }),
  getAnnouncements: () => get('/student/announcements'),
  getNotifications: () => get('/student/notifications'),
  getActivities: () => get('/student/activities'),
  getHelpdeskTickets: () => get('/student/helpdesk'),
  getDocumentRequests: () => get('/student/document-requests'),

  // Mutations
  submitAssignment: (assignmentId, data) => post(`/student/assignments/${assignmentId}/submit`, data),
  submitAssignmentFiles: (assignmentId, formData) => upload(`/student/assignments/${assignmentId}/upload`, formData),
  requestAttendanceCorrection: (data) => post('/student/attendance-corrections', data),
  submitActivity: (data) => post('/student/activities', data),
  createHelpdeskTicket: (data) => post('/student/helpdesk', data),
  replyHelpdeskTicket: (ticketId, data) => post(`/student/helpdesk/${ticketId}/reply`, data),
  requestDocument: (data) => post('/student/document-requests', data),
  submitRevaluation: (data) => post('/student/revaluations', data),
  markNotificationRead: (id) => put(`/student/notifications/${id}/read`),
  markAllNotificationsRead: () => put('/student/notifications/read-all'),
  markAnnouncementRead: (id) => put(`/student/announcements/${id}/read`),
};

// ── Faculty API (scoped to allocated courses) ───────────────────
export const facultyApi = {
  getProfile: () => get('/faculty/profile'),
  getCourses: () => get('/faculty/courses'),
  getCourseDetail: (courseId) => get(`/faculty/courses/${courseId}`),
  getCourseStudents: (courseId) => get(`/faculty/courses/${courseId}/students`),
  getTimetable: (day) => get('/faculty/timetable', { day }),

  // Attendance
  getAttendanceSessions: (courseId) => get(`/faculty/courses/${courseId}/attendance`),
  submitAttendance: (data) => post('/faculty/attendance-sessions', data),
  getCorrectionRequests: () => get('/faculty/attendance-corrections'),
  reviewCorrectionRequest: (id, data) => put(`/faculty/attendance-corrections/${id}`, data),

  // Assessment & Marks
  getAssessments: (courseId) => get(`/faculty/courses/${courseId}/assessments`),
  createAssessment: (data) => post('/faculty/assessments', data),
  saveMarks: (courseId, data) => post(`/faculty/courses/${courseId}/marks`, data),
  publishMarks: (courseId, componentType) => put(`/faculty/courses/${courseId}/marks/publish`, { componentType }),

  // Assignments
  getAssignments: (courseId) => get(`/faculty/courses/${courseId}/assignments`),
  createAssignment: (data) => post('/faculty/assignments', data),
  getSubmissions: (assignmentId) => get(`/faculty/assignments/${assignmentId}/submissions`),
  gradeSubmission: (submissionId, data) => put(`/faculty/submissions/${submissionId}/grade`, data),
  remindPendingStudents: (assignmentId) => post(`/faculty/assignments/${assignmentId}/remind`),

  // Materials
  getMaterials: (courseId) => get(`/faculty/courses/${courseId}/materials`),
  uploadMaterial: (data) => post('/faculty/materials', data),
  deleteMaterial: (id) => del(`/faculty/materials/${id}`),

  // Announcements
  getAnnouncements: () => get('/faculty/announcements'),
  postAnnouncement: (data) => post('/faculty/announcements', data),

  // Activity Verifications
  getPendingActivities: () => get('/faculty/activity-verifications'),
  verifyActivity: (id, data) => put(`/faculty/activities/${id}/verify`, data),

  // Student Requests
  getStudentRequests: () => get('/faculty/student-requests'),
  resolveStudentRequest: (ticketId, data) => put(`/faculty/student-requests/${ticketId}/resolve`, data),

  // Lab Experiments
  getLabExperiments: (courseId) => get(`/faculty/courses/${courseId}/lab-experiments`),
  gradeLabExperiment: (experimentId, data) => put(`/faculty/lab-experiments/${experimentId}/grade`, data),

  // Course Reports
  getCourseReport: (courseId) => get(`/faculty/courses/${courseId}/report`),
};

// ── HOD API (scoped to department) ──────────────────────────────
export const hodApi = {
  getProfile: () => get('/hod/profile'),
  getOverview: () => get('/hod/overview'),

  // Approvals
  getApprovals: (type, status) => get('/hod/approvals', { type, status }),
  approveRequest: (id, data) => put(`/hod/approvals/${id}/decide`, data),

  // Academic Monitoring
  getAcademicHealth: () => get('/hod/academic-monitoring'),
  getAttendanceBands: () => get('/hod/academic-monitoring/attendance-bands'),

  // Students at Risk
  getStudentsAtRisk: () => get('/hod/students-at-risk'),
  assignMentor: (caseId, data) => put(`/hod/students-at-risk/${caseId}/assign-mentor`, data),
  updateRiskStatus: (caseId, data) => put(`/hod/students-at-risk/${caseId}/status`, data),

  // Backlogs
  getBacklogs: () => get('/hod/backlogs'),
  updateBacklogPlan: (id, data) => put(`/hod/backlogs/${id}/plan`, data),

  // Faculty Allocations
  getFacultyAllocations: () => get('/hod/faculty-allocations'),
  allocateFaculty: (data) => post('/hod/faculty-allocations', data),

  // Timetable
  getTimetable: (day) => get('/hod/timetable', { day }),
  publishTimetable: (workspaceId) => put(`/hod/timetable/${workspaceId}/publish`),

  // Academic Records
  getAcademicRecords: () => get('/hod/academic-records'),
  lockRecords: (workspaceId, lockType) => put(`/hod/academic-records/${workspaceId}/lock`, { lockType }),

  // Reports
  getReport: (type) => get(`/hod/reports/${type}`),

  // Audit
  getAuditLogs: (filters) => get('/hod/audit', filters),
};

// ── Admin API (institution-wide access) ─────────────────────────
export const adminApi = {
  // Workspaces
  getWorkspaces: () => get('/admin/workspaces'),
  createWorkspace: (data) => post('/admin/workspaces', data),
  updateWorkspaceStatus: (id, status) => put(`/admin/workspaces/${id}/status`, { status }),

  // Students
  getStudents: (params) => get('/admin/students', params),
  createStudent: (data) => post('/admin/students', data),
  updateStudent: (id, data) => put(`/admin/students/${id}`, data),
  getImportTemplate: () => apiClient.get('/admin/students/import-template', { responseType: 'blob' }),
  importStudents: (formData) => upload('/admin/students/import', formData),
  confirmImport: (jobId) => post(`/admin/students/import/${jobId}/confirm`),
  getImportJobs: () => get('/admin/import-jobs'),
  getImportErrors: (jobId) => get(`/admin/import-jobs/${jobId}/errors`),

  // Courses
  getCourses: (workspaceId) => get(`/admin/workspaces/${workspaceId}/courses`),
  mapCourse: (workspaceId, data) => post(`/admin/workspaces/${workspaceId}/courses`, data),
  updateCourse: (id, data) => put(`/admin/courses/${id}`, data),

  // Faculty
  getFaculty: () => get('/admin/faculty'),
  createFaculty: (data) => post('/admin/faculty', data),
  allocateFaculty: (data) => post('/admin/faculty-allocations', data),
  removeAllocation: (id) => del(`/admin/faculty-allocations/${id}`),

  // Timetable
  getTimetable: (workspaceId) => get(`/admin/workspaces/${workspaceId}/timetable`),
  createTimetableEntry: (data) => post('/admin/timetable', data),
  updateTimetableEntry: (id, data) => put(`/admin/timetable/${id}`, data),
  publishTimetable: (workspaceId) => put(`/admin/timetable/${workspaceId}/publish`),

  // Academic Records
  getAcademicRecords: (workspaceId) => get(`/admin/workspaces/${workspaceId}/records`),
  lockAcademicRecords: (workspaceId, lockType) => put(`/admin/workspaces/${workspaceId}/lock`, { lockType }),

  // Reports
  getReports: (type, params) => get(`/admin/reports/${type}`, params),
  exportReport: (type, format, params) => apiClient.get(`/admin/reports/${type}/export`, {
    params: { format, ...params },
    responseType: 'blob'
  }),

  // Audit
  getAuditLogs: (params) => get('/admin/audit', params),

  // Calendar
  getCalendar: (workspaceId) => get(`/admin/workspaces/${workspaceId}/calendar`),
  uploadCalendar: (workspaceId, data) => post(`/admin/workspaces/${workspaceId}/calendar`, data),

  // Files
  uploadFile: (formData) => upload('/admin/files', formData),
  deleteFile: (id) => del(`/admin/files/${id}`),
};

// ── Shared API (accessible by all authenticated roles) ──────────
export const sharedApi = {
  getHealth: () => get('/health'),
  getAcademicYear: () => get('/shared/academic-year'),
  getSemesters: () => get('/shared/semesters'),
  downloadFile: (fileId) => apiClient.get(`/shared/files/${fileId}/download`, { responseType: 'blob' }),
};

export default {
  auth: authApi,
  student: studentApi,
  faculty: facultyApi,
  hod: hodApi,
  admin: adminApi,
  shared: sharedApi,
};
