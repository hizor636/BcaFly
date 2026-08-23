import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const PLATFORM_NAV = {
  ADMIN: [
    { title: 'SEMESTER WORKSPACE CONFIGURATION', isHeader: true },
    { path: '/admin/overview', label: 'Workspace Overview', icon: '📊' },
    { path: '/admin/courses', label: 'Semester-Specific Courses', icon: '📚' },
    { path: '/admin/students', label: 'Semester Enrolment', icon: '🎓' },
    { path: '/admin/faculty', label: 'Assigned Faculty', icon: '👨‍🏫' },
    { path: '/admin/timetable', label: 'Semester Timetable', icon: '🗓️' },
    { title: 'SEMESTER GOVERNANCE', isHeader: true },
    { path: '/admin/academic-records', label: 'Semester Academic Records', icon: '🗂️' },
    { path: '/admin/reports', label: 'Semester Reports & Exports', icon: '📄' },
    { path: '/admin/audit', label: 'Immutable Audit Log', icon: '🔒' }
  ],
  HOD: [
    { title: 'GOVERNANCE & APPROVALS', isHeader: true },
    { path: '/hod/overview', label: 'Department Dashboard', icon: '🏛️' },
    { path: '/hod/approvals', label: 'Approvals Centre', icon: '⚡' },
    { path: '/hod/academic-monitoring', label: 'Academic Health Monitor', icon: '📊' },
    { path: '/hod/students-at-risk', label: 'Students at Risk (Intervention)', icon: '🚨' },

    { title: 'ACADEMIC OPERATIONS', isHeader: true },
    { path: '/hod/backlogs', label: 'Backlogs & Remedial Plans', icon: '⚠️' },
    { path: '/hod/faculty-allocations', label: 'Faculty Course Allocations', icon: '👨‍🏫' },
    { path: '/hod/timetable', label: 'Timetable Governance', icon: '🗓️' },
    { path: '/hod/academic-records', label: 'Semester Academic Records', icon: '🗂️' },

    { title: 'REPORTS & AUDIT', isHeader: true },
    { path: '/hod/reports', label: 'Department Analytics Reports', icon: '📈' },
    { path: '/hod/audit', label: 'Department Audit Trail', icon: '🔒' },
    { path: '/hod/profile', label: 'HOD Leadership Profile', icon: '👤' }
  ],
  FACULTY: [
    { title: 'TEACHING & CLASSROOM', isHeader: true },
    { path: '/faculty/overview', label: 'Faculty Dashboard', icon: '📊' },
    { path: '/faculty/timetable', label: 'Teaching Schedule', icon: '🗓️' },
    { path: '/faculty/courses', label: 'Assigned Courses & Labs', icon: '📚' },
    { path: '/faculty/attendance', label: 'Session Attendance', icon: '⏱️' },

    { title: 'EVALUATION & COURSEWARE', isHeader: true },
    { path: '/faculty/assessments', label: 'Assessment & Marks', icon: '📋' },
    { path: '/faculty/assignments', label: 'Assignments & Tasks', icon: '📝' },
    { path: '/faculty/materials', label: 'Course Study Materials', icon: '📁' },

    { title: 'STUDENT ENGAGEMENT', isHeader: true },
    { path: '/faculty/announcements', label: 'Course Announcements', icon: '📢' },
    { path: '/faculty/activities', label: 'Activity & OD Review', icon: '🎖️' },
    { path: '/faculty/student-requests', label: 'Student Requests Queue', icon: '💬' },

    { title: 'ANALYTICS & PROFILE', isHeader: true },
    { path: '/faculty/reports', label: 'Course Reports & Risk', icon: '📈' },
    { path: '/faculty/profile', label: 'Faculty Profile', icon: '👤' }
  ],
  STUDENT: [
    { title: 'DAILY ACADEMIC WORKSPACE', isHeader: true },
    { path: '/student/overview', label: 'Daily Academic Dashboard', icon: '📊' },
    { path: '/student/timetable', label: 'Class Timetable', icon: '🗓️' },
    { path: '/student/announcements', label: 'Announcements & Notices', icon: '📢' },
    { path: '/student/assignments', label: 'Assignments & Tasks', icon: '📝' },
    { path: '/student/materials', label: 'Course Study Materials', icon: '📚' },

    { title: 'ACADEMIC TRANSPARENCY', isHeader: true },
    { path: '/student/attendance', label: 'Detailed Attendance', icon: '⏱️' },
    { path: '/student/marks', label: 'Assessment Scores', icon: '📋' },
    { path: '/student/results', label: 'Exam Results & Grades', icon: '🏆' },

    { title: 'CO-CURRICULAR & WORKFLOW', isHeader: true },
    { path: '/student/submit-activity', label: 'Activity & OD Claims', icon: '🎖️' },

    { title: 'STUDENT SERVICES & SUPPORT', isHeader: true },
    { path: '/student/helpdesk', label: 'Helpdesk & Ticketing', icon: '💬' },
    { path: '/student/profile', label: 'Profile & Documents', icon: '👤' }
  ]
};

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role?.toUpperCase() || 'ADMIN';
  const navItems = PLATFORM_NAV[role] || PLATFORM_NAV.ADMIN;

  const handleExit = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-64 shrink-0 bg-[var(--ink-dark)] text-[var(--parchment)] flex flex-col justify-between border-r border-white/10 shadow-xl min-h-screen">
      <div>
        {/* Platform Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F5E8C9] text-[#B8892D] flex items-center justify-center font-brand font-bold text-lg shadow-sm">
              B
            </div>
            <div>
              <div className="font-brand font-bold text-lg text-white leading-tight">BcaFly</div>
              <div className="text-[9px] font-mono tracking-widest text-[var(--brass)] uppercase">
                {role === 'ADMIN' ? 'Administrator Platform' : role === 'HOD' ? 'HOD Platform' : role === 'FACULTY' ? 'Faculty Platform' : 'Student Platform'}
              </div>
            </div>
          </div>
          <button
            onClick={handleExit}
            title="Exit to Platform Access"
            className="text-white/60 hover:text-white text-xs font-mono p-1 cursor-pointer"
          >
            🚪
          </button>
        </div>

        {/* Authorized Platform Label */}
        <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[9px] font-mono tracking-widest text-white/50 uppercase">AUTHORISED ACCESS</div>
            <div className="text-xs font-mono text-white font-semibold truncate max-w-[140px]">
              {user?.name || (role === 'ADMIN' ? 'Administrator' : role)}
            </div>
          </div>
          <span className="ws-tag text-[9px]">ACTIVE</span>
        </div>

        {/* Dynamic Navigation Links */}
        <nav className="p-2 space-y-0.5 max-h-[calc(100vh-170px)] overflow-y-auto">
          {navItems.map((item, idx) => {
            if (item.isHeader) {
              return (
                <div key={idx} className="sidebar-section-title">
                  {item.title}
                </div>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono rounded ${
                    isActive ? 'active' : ''
                  }`
                }
              >
                <span>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footnote */}
      <div className="p-3 border-t border-white/10 bg-black/20 flex items-center justify-between text-xs font-mono">
        <div className="truncate">
          <div className="text-white font-semibold truncate">{user?.name || 'Dr. A. Sharma'}</div>
          <div className="text-[10px] text-[var(--brass)]">{user?.roleLabel || role}</div>
        </div>
        <button
          onClick={handleExit}
          className="px-2 py-1 text-[10px] text-white/70 hover:text-white border border-white/20 rounded hover:bg-white/10 transition cursor-pointer"
        >
          Exit
        </button>
      </div>
    </aside>
  );
};
