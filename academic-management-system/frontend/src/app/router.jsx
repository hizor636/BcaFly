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

// HOD Pages (Lazy Loaded)
const HodOverviewPage = lazy(() => import('../features/hod/pages/HodOverviewPage').then(m => ({ default: m.HodOverviewPage })));
const HodApprovalsPage = lazy(() => import('../features/hod/pages/HodApprovalsPage').then(m => ({ default: m.HodApprovalsPage })));
const HodBacklogsPage = lazy(() => import('../features/hod/pages/HodBacklogsPage').then(m => ({ default: m.HodBacklogsPage })));

// Faculty Pages (Lazy Loaded)
const FacultyOverviewPage = lazy(() => import('../features/faculty/pages/FacultyOverviewPage').then(m => ({ default: m.FacultyOverviewPage })));
const FacultyAttendancePage = lazy(() => import('../features/faculty/pages/FacultyAttendancePage').then(m => ({ default: m.FacultyAttendancePage })));
const FacultyMarksPage = lazy(() => import('../features/faculty/pages/FacultyMarksPage').then(m => ({ default: m.FacultyMarksPage })));
const FacultyReportsPage = lazy(() => import('../features/faculty/pages/FacultyReportsPage').then(m => ({ default: m.FacultyReportsPage })));

// Student Pages (Lazy Loaded)
const StudentOverviewPage = lazy(() => import('../features/student/pages/StudentOverviewPage').then(m => ({ default: m.StudentOverviewPage })));
const StudentAttendancePage = lazy(() => import('../features/student/pages/StudentAttendancePage').then(m => ({ default: m.StudentAttendancePage })));
const StudentMarksPage = lazy(() => import('../features/student/pages/StudentMarksPage').then(m => ({ default: m.StudentMarksPage })));
const StudentResultsPage = lazy(() => import('../features/student/pages/StudentResultsPage').then(m => ({ default: m.StudentResultsPage })));
const StudentSubmitActivityPage = lazy(() => import('../features/student/pages/StudentSubmitActivityPage').then(m => ({ default: m.StudentSubmitActivityPage })));

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

      // HOD Routes
      { path: 'hod/overview', element: <SuspenseWrapper><HodOverviewPage /></SuspenseWrapper> },
      { path: 'hod/approvals', element: <SuspenseWrapper><HodApprovalsPage /></SuspenseWrapper> },
      { path: 'hod/backlogs', element: <SuspenseWrapper><HodBacklogsPage /></SuspenseWrapper> },

      // Faculty Routes
      { path: 'faculty/overview', element: <SuspenseWrapper><FacultyOverviewPage /></SuspenseWrapper> },
      { path: 'faculty/attendance', element: <SuspenseWrapper><FacultyAttendancePage /></SuspenseWrapper> },
      { path: 'faculty/marks', element: <SuspenseWrapper><FacultyMarksPage /></SuspenseWrapper> },
      { path: 'faculty/reports', element: <SuspenseWrapper><FacultyReportsPage /></SuspenseWrapper> },

      // Student Routes
      { path: 'student/overview', element: <SuspenseWrapper><StudentOverviewPage /></SuspenseWrapper> },
      { path: 'student/attendance', element: <SuspenseWrapper><StudentAttendancePage /></SuspenseWrapper> },
      { path: 'student/marks', element: <SuspenseWrapper><StudentMarksPage /></SuspenseWrapper> },
      { path: 'student/results', element: <SuspenseWrapper><StudentResultsPage /></SuspenseWrapper> },
      { path: 'student/submit-activity', element: <SuspenseWrapper><StudentSubmitActivityPage /></SuspenseWrapper> },

      // Redirect unknown dashboard routes
      { path: 'dashboard', element: <Navigate to="/admin/overview" replace /> }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
