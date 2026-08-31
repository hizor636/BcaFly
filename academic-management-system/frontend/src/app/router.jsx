import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { LandingPage } from '../features/landing/LandingPage';

// Admin Pages (Lazy Loaded)
const AdminOverviewPage = lazy(() => import('../features/admin/pages/AdminOverviewPage').then(m => ({ default: m.AdminOverviewPage })));
const AdminCoursesPage = lazy(() => import('../features/admin/pages/AdminCoursesPage').then(m => ({ default: m.AdminCoursesPage })));
const AdminStudentsPage = lazy(() => import('../features/admin/pages/AdminStudentsPage').then(m => ({ default: m.AdminStudentsPage })));
const AdminFacultyPage = lazy(() => import('../features/admin/pages/AdminFacultyPage').then(m => ({ default: m.AdminFacultyPage })));
const AdminTimetablePage = lazy(() => import('../features/admin/pages/AdminTimetablePage').then(m => ({ default: m.AdminTimetablePage })));
const AdminAcademicRecordsPage = lazy(() => import('../features/admin/pages/AdminAcademicRecordsPage').then(m => ({ default: m.AdminAcademicRecordsPage })));
const AdminReportsPage = lazy(() => import('../features/admin/pages/AdminReportsPage').then(m => ({ default: m.AdminReportsPage })));
const AdminAuditPage = lazy(() => import('../features/admin/pages/AdminAuditPage').then(m => ({ default: m.AdminAuditPage })));
const AdminDatabaseResetPage = lazy(() => import('../features/admin/pages/AdminDatabaseResetPage').then(m => ({ default: m.AdminDatabaseResetPage })));

// HOD Pages (Lazy Loaded)
const HodOverviewPage = lazy(() => import('../features/hod/pages/HodOverviewPage').then(m => ({ default: m.HodOverviewPage })));
const HodApprovalsPage = lazy(() => import('../features/hod/pages/HodApprovalsPage').then(m => ({ default: m.HodApprovalsPage })));
const HodAcademicMonitoringPage = lazy(() => import('../features/hod/pages/HodAcademicMonitoringPage').then(m => ({ default: m.HodAcademicMonitoringPage })));
const HodStudentsAtRiskPage = lazy(() => import('../features/hod/pages/HodStudentsAtRiskPage').then(m => ({ default: m.HodStudentsAtRiskPage })));
const HodBacklogsPage = lazy(() => import('../features/hod/pages/HodBacklogsPage').then(m => ({ default: m.HodBacklogsPage })));
const HodFacultyAllocationsPage = lazy(() => import('../features/hod/pages/HodFacultyAllocationsPage').then(m => ({ default: m.HodFacultyAllocationsPage })));
const HodTimetablePage = lazy(() => import('../features/hod/pages/HodTimetablePage').then(m => ({ default: m.HodTimetablePage })));
const HodAcademicRecordsPage = lazy(() => import('../features/hod/pages/HodAcademicRecordsPage').then(m => ({ default: m.HodAcademicRecordsPage })));
const HodReportsPage = lazy(() => import('../features/hod/pages/HodReportsPage').then(m => ({ default: m.HodReportsPage })));
const HodAuditPage = lazy(() => import('../features/hod/pages/HodAuditPage').then(m => ({ default: m.HodAuditPage })));
const HodProfilePage = lazy(() => import('../features/hod/pages/HodProfilePage').then(m => ({ default: m.HodProfilePage })));

// Faculty Pages (Lazy Loaded)
const FacultyOverviewPage = lazy(() => import('../features/faculty/pages/FacultyOverviewPage').then(m => ({ default: m.FacultyOverviewPage })));
const FacultyTimetablePage = lazy(() => import('../features/faculty/pages/FacultyTimetablePage').then(m => ({ default: m.FacultyTimetablePage })));
const FacultyCoursesPage = lazy(() => import('../features/faculty/pages/FacultyCoursesPage').then(m => ({ default: m.FacultyCoursesPage })));
const FacultyCourseDetailPage = lazy(() => import('../features/faculty/pages/FacultyCourseDetailPage').then(m => ({ default: m.FacultyCourseDetailPage })));
const FacultyAttendancePage = lazy(() => import('../features/faculty/pages/FacultyAttendancePage').then(m => ({ default: m.FacultyAttendancePage })));
const FacultyAssessmentsPage = lazy(() => import('../features/faculty/pages/FacultyAssessmentsPage').then(m => ({ default: m.FacultyAssessmentsPage })));
const FacultyAssignmentsPage = lazy(() => import('../features/faculty/pages/FacultyAssignmentsPage').then(m => ({ default: m.FacultyAssignmentsPage })));
const FacultyMaterialsPage = lazy(() => import('../features/faculty/pages/FacultyMaterialsPage').then(m => ({ default: m.FacultyMaterialsPage })));
const FacultyAnnouncementsPage = lazy(() => import('../features/faculty/pages/FacultyAnnouncementsPage').then(m => ({ default: m.FacultyAnnouncementsPage })));
const FacultyActivitiesPage = lazy(() => import('../features/faculty/pages/FacultyActivitiesPage').then(m => ({ default: m.FacultyActivitiesPage })));
const FacultyStudentRequestsPage = lazy(() => import('../features/faculty/pages/FacultyStudentRequestsPage').then(m => ({ default: m.FacultyStudentRequestsPage })));
const FacultyReportsPage = lazy(() => import('../features/faculty/pages/FacultyReportsPage').then(m => ({ default: m.FacultyReportsPage })));
const FacultyProfilePage = lazy(() => import('../features/faculty/pages/FacultyProfilePage').then(m => ({ default: m.FacultyProfilePage })));

// Student Pages (Lazy Loaded)
const StudentOverviewPage = lazy(() => import('../features/student/pages/StudentOverviewPage').then(m => ({ default: m.StudentOverviewPage })));
const StudentTimetablePage = lazy(() => import('../features/student/pages/StudentTimetablePage').then(m => ({ default: m.StudentTimetablePage })));
const StudentAnnouncementsPage = lazy(() => import('../features/student/pages/StudentAnnouncementsPage').then(m => ({ default: m.StudentAnnouncementsPage })));
const StudentAssignmentsPage = lazy(() => import('../features/student/pages/StudentAssignmentsPage').then(m => ({ default: m.StudentAssignmentsPage })));
const StudentMaterialsPage = lazy(() => import('../features/student/pages/StudentMaterialsPage').then(m => ({ default: m.StudentMaterialsPage })));
const StudentAttendancePage = lazy(() => import('../features/student/pages/StudentAttendancePage').then(m => ({ default: m.StudentAttendancePage })));
const StudentMarksPage = lazy(() => import('../features/student/pages/StudentMarksPage').then(m => ({ default: m.StudentMarksPage })));
const StudentResultsPage = lazy(() => import('../features/student/pages/StudentResultsPage').then(m => ({ default: m.StudentResultsPage })));
const StudentSubmitActivityPage = lazy(() => import('../features/student/pages/StudentSubmitActivityPage').then(m => ({ default: m.StudentSubmitActivityPage })));
const StudentHelpdeskPage = lazy(() => import('../features/student/pages/StudentHelpdeskPage').then(m => ({ default: m.StudentHelpdeskPage })));
const StudentProfilePage = lazy(() => import('../features/student/pages/StudentProfilePage').then(m => ({ default: m.StudentProfilePage })));

const SuspenseWrapper = ({ children }) => (
  <Suspense
    fallback={
      <div className="p-8 flex items-center justify-center font-mono text-xs text-[var(--slate)]">
        <div className="flex items-center gap-2">
          <span className="animate-spin">⏳</span> Loading workspace module...
        </div>
      </div>
    }
  >
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // Admin Routes
      { path: 'admin/overview', element: <SuspenseWrapper><AdminOverviewPage /></SuspenseWrapper> },
      { path: 'admin/courses', element: <SuspenseWrapper><AdminCoursesPage /></SuspenseWrapper> },
      { path: 'admin/students', element: <SuspenseWrapper><AdminStudentsPage /></SuspenseWrapper> },
      { path: 'admin/faculty', element: <SuspenseWrapper><AdminFacultyPage /></SuspenseWrapper> },
      { path: 'admin/timetable', element: <SuspenseWrapper><AdminTimetablePage /></SuspenseWrapper> },
      
      // Unified Semester Governance Workspace
      { path: 'admin/academic-records', element: <SuspenseWrapper><AdminAcademicRecordsPage /></SuspenseWrapper> },
      
      // Legacy Route Redirects to Unified Academic Records
      { path: 'admin/attendance', element: <Navigate to="/admin/academic-records" replace /> },
      { path: 'admin/marks', element: <Navigate to="/admin/academic-records" replace /> },
      { path: 'admin/results', element: <Navigate to="/admin/academic-records" replace /> },
      { path: 'admin/activities', element: <Navigate to="/admin/academic-records" replace /> },
      
      { path: 'admin/reports', element: <SuspenseWrapper><AdminReportsPage /></SuspenseWrapper> },
      { path: 'admin/audit', element: <SuspenseWrapper><AdminAuditPage /></SuspenseWrapper> },
      { path: 'admin/database-reset', element: <SuspenseWrapper><AdminDatabaseResetPage /></SuspenseWrapper> },
      { path: 'admin/settings/database-reset', element: <SuspenseWrapper><AdminDatabaseResetPage /></SuspenseWrapper> },

      // HOD Routes
      { path: 'hod/overview', element: <SuspenseWrapper><HodOverviewPage /></SuspenseWrapper> },
      { path: 'hod/approvals', element: <SuspenseWrapper><HodApprovalsPage /></SuspenseWrapper> },
      { path: 'hod/academic-monitoring', element: <SuspenseWrapper><HodAcademicMonitoringPage /></SuspenseWrapper> },
      { path: 'hod/students-at-risk', element: <SuspenseWrapper><HodStudentsAtRiskPage /></SuspenseWrapper> },
      { path: 'hod/backlogs', element: <SuspenseWrapper><HodBacklogsPage /></SuspenseWrapper> },
      { path: 'hod/faculty-allocations', element: <SuspenseWrapper><HodFacultyAllocationsPage /></SuspenseWrapper> },
      { path: 'hod/timetable', element: <SuspenseWrapper><HodTimetablePage /></SuspenseWrapper> },
      { path: 'hod/academic-records', element: <SuspenseWrapper><HodAcademicRecordsPage /></SuspenseWrapper> },
      { path: 'hod/reports', element: <SuspenseWrapper><HodReportsPage /></SuspenseWrapper> },
      { path: 'hod/audit', element: <SuspenseWrapper><HodAuditPage /></SuspenseWrapper> },
      { path: 'hod/profile', element: <SuspenseWrapper><HodProfilePage /></SuspenseWrapper> },

      // Faculty Routes
      { path: 'faculty/overview', element: <SuspenseWrapper><FacultyOverviewPage /></SuspenseWrapper> },
      { path: 'faculty/timetable', element: <SuspenseWrapper><FacultyTimetablePage /></SuspenseWrapper> },
      { path: 'faculty/courses', element: <SuspenseWrapper><FacultyCoursesPage /></SuspenseWrapper> },
      { path: 'faculty/courses/:courseId', element: <SuspenseWrapper><FacultyCourseDetailPage /></SuspenseWrapper> },
      { path: 'faculty/attendance', element: <SuspenseWrapper><FacultyAttendancePage /></SuspenseWrapper> },
      { path: 'faculty/assessments', element: <SuspenseWrapper><FacultyAssessmentsPage /></SuspenseWrapper> },
      { path: 'faculty/marks', element: <Navigate to="/faculty/assessments" replace /> },
      { path: 'faculty/assignments', element: <SuspenseWrapper><FacultyAssignmentsPage /></SuspenseWrapper> },
      { path: 'faculty/materials', element: <SuspenseWrapper><FacultyMaterialsPage /></SuspenseWrapper> },
      { path: 'faculty/announcements', element: <SuspenseWrapper><FacultyAnnouncementsPage /></SuspenseWrapper> },
      { path: 'faculty/activities', element: <SuspenseWrapper><FacultyActivitiesPage /></SuspenseWrapper> },
      { path: 'faculty/student-requests', element: <SuspenseWrapper><FacultyStudentRequestsPage /></SuspenseWrapper> },
      { path: 'faculty/reports', element: <SuspenseWrapper><FacultyReportsPage /></SuspenseWrapper> },
      { path: 'faculty/profile', element: <SuspenseWrapper><FacultyProfilePage /></SuspenseWrapper> },

      // Student Routes
      { path: 'student/overview', element: <SuspenseWrapper><StudentOverviewPage /></SuspenseWrapper> },
      { path: 'student/timetable', element: <SuspenseWrapper><StudentTimetablePage /></SuspenseWrapper> },
      { path: 'student/announcements', element: <SuspenseWrapper><StudentAnnouncementsPage /></SuspenseWrapper> },
      { path: 'student/assignments', element: <SuspenseWrapper><StudentAssignmentsPage /></SuspenseWrapper> },
      { path: 'student/materials', element: <SuspenseWrapper><StudentMaterialsPage /></SuspenseWrapper> },
      { path: 'student/courses/:courseId/materials', element: <SuspenseWrapper><StudentMaterialsPage /></SuspenseWrapper> },
      { path: 'student/attendance', element: <SuspenseWrapper><StudentAttendancePage /></SuspenseWrapper> },
      { path: 'student/marks', element: <SuspenseWrapper><StudentMarksPage /></SuspenseWrapper> },
      { path: 'student/results', element: <SuspenseWrapper><StudentResultsPage /></SuspenseWrapper> },
      { path: 'student/submit-activity', element: <SuspenseWrapper><StudentSubmitActivityPage /></SuspenseWrapper> },
      { path: 'student/helpdesk', element: <SuspenseWrapper><StudentHelpdeskPage /></SuspenseWrapper> },
      { path: 'student/profile', element: <SuspenseWrapper><StudentProfilePage /></SuspenseWrapper> },

      // Redirect unknown dashboard routes
      { path: 'dashboard', element: <Navigate to="/admin/overview" replace /> }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
