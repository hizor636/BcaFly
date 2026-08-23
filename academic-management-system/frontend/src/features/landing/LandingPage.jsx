import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAcademic } from '../../context/AcademicContext';
import { Modal } from '../../components/ui/Modal';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { loginStaff, loginStudent } = useAuth();
  const { semesters, setActiveSemester } = useAcademic();

  // Modals state
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [pendingStaffRole, setPendingStaffRole] = useState('admin');
  const [staffUser, setStaffUser] = useState('admin');
  const [staffPass, setStaffPass] = useState('');
  const [staffError, setStaffError] = useState('');

  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('Rahul Kumar');
  const [studentSem, setStudentSem] = useState('3');
  const [studentError, setStudentError] = useState('');

  const openStaffLogin = (role) => {
    setPendingStaffRole(role);
    setStaffUser(role);
    setStaffPass('');
    setStaffError('');
    setStaffModalOpen(true);
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setStaffError('');
    try {
      await loginStaff(staffUser, staffPass, pendingStaffRole);
      setStaffModalOpen(false);
      if (pendingStaffRole === 'admin') navigate('/admin/overview');
      else if (pendingStaffRole === 'hod') navigate('/hod/overview');
      else if (pendingStaffRole === 'faculty') navigate('/faculty/overview');
    } catch (err) {
      setStaffError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setStudentError('');
    if (!studentName.trim()) {
      setStudentError('Please enter your registered student name.');
      return;
    }

    try {
      const allStudents = Object.values(semesters).flatMap(s => s.students || []);
      const semNum = Number(studentSem);
      setActiveSemester(semNum);
      await loginStudent(studentName, semNum, allStudents);
      setStudentModalOpen(false);
      navigate('/student/overview');
    } catch (err) {
      setStudentError('Student verification failed. Please check registered name and semester.');
    }
  };

  const roleTitles = {
    admin: 'Administrator',
    hod: 'HOD',
    faculty: 'Faculty'
  };

  const demoHints = {
    admin: { user: 'admin', pass: 'admin@123' },
    hod: { user: 'hod', pass: 'hod@123' },
    faculty: { user: 'faculty', pass: 'faculty@123' }
  };

  return (
    <div className="min-h-screen bg-[var(--parchment)] text-[var(--ink)] overflow-x-hidden">
      {/* Landing Header */}
      <header className="page-container pt-8 sm:pt-12 pb-4 sm:pb-6">
        <div className="site-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F5E8C9] border border-[#EAD6AB] text-[#B8892D] flex items-center justify-center font-brand font-bold text-xl sm:text-2xl shadow-xs shrink-0">
              B
            </div>
            <div>
              <div className="font-brand font-bold text-xl sm:text-2xl text-[var(--ink)] leading-none">BcaFly</div>
              <div className="text-[10px] font-mono font-bold tracking-widest text-[var(--brass-2)] uppercase mt-1">
                BCA Academic Workspaces
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <span className="ws-tag justify-center text-center text-[10px] sm:text-[11px] py-1">
              AUTHORISED PLATFORM ACCESS
            </span>
            <button
              onClick={() => openStaffLogin('admin')}
              className="btn-ink text-xs font-mono px-4 py-2.5 rounded-md w-full sm:w-auto min-h-[44px]"
            >
              ADMINISTRATOR LOGIN →
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & 4 Platform Cards */}
      <section className="page-container py-4 sm:py-8 grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[10px] sm:text-[11px] mb-4">
            <span className="text-sm">🏛️</span> SIX SEMESTER-BASED ENVIRONMENTS
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.12] mb-4 sm:mb-5 text-[var(--ink)] brass-underline pb-3 font-semibold text-safe">
            BCA Academic Workspaces.<br />Independent Semester Data.
          </h1>
          <p className="text-[var(--slate)] text-sm sm:text-base leading-relaxed mb-6 max-w-lg text-safe">
            BcaFly supports all six BCA semesters through isolated academic environments. Each semester maintains
            independent course configurations, student enrolments, faculty allocations, timetables, and assessments.
          </p>

          {/* Semester Navigator Pills Preview */}
          <div className="mb-6">
            <div className="text-[11px] font-mono text-[var(--slate)] uppercase font-semibold mb-2.5">
              Supported Semester Workspaces:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              {[1, 2, 3, 4, 5, 6].map(s => (
                <div
                  key={s}
                  className="px-3 py-2 bg-white border border-[var(--rule)] rounded-md font-semibold text-[var(--ink)] text-center flex items-center justify-center min-h-[40px] shadow-xs"
                >
                  Semester {s}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs font-mono text-[var(--slate)] uppercase tracking-wider hidden sm:block">
            Select your authorised platform to enter:
          </p>
        </div>

        {/* Four Independent Platforms Grid */}
        <div className="lg:col-span-6 ledger-lines rounded-xl p-3 sm:p-4 bg-[var(--parchment-2)] border border-[var(--rule)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
            {/* Platform: Administrator */}
            <button
              onClick={() => openStaffLogin('admin')}
              className="role-card rounded-lg p-4 sm:p-5 text-left flex flex-col justify-between min-h-[160px] sm:h-48 cursor-pointer w-full"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[9px] sm:text-[10px] font-bold text-[var(--brass-2)] tracking-wider">ALL SIX SEMESTERS</span>
                  <span className="text-base sm:text-lg">👑</span>
                </div>
                <div className="font-display font-bold text-base sm:text-lg text-[var(--ink)] mb-1 text-safe">Administrator Platform</div>
                <div className="text-[11px] text-[var(--slate)] leading-snug text-safe">
                  Configure academic setup, manage courses, enrolment rosters, sections, and promotions.
                </div>
              </div>
              <div className="font-mono text-[10px] sm:text-[11px] text-[var(--brass)] font-semibold flex items-center gap-1 mt-3 pt-2 border-t border-[var(--rule)]/50 sm:border-t-0">
                Enter Admin Platform →
              </div>
            </button>

            {/* Platform: HOD */}
            <button
              onClick={() => openStaffLogin('hod')}
              className="role-card rounded-lg p-4 sm:p-5 text-left flex flex-col justify-between min-h-[160px] sm:h-48 cursor-pointer w-full"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[9px] sm:text-[10px] font-bold text-[var(--brass-2)] tracking-wider">DEPARTMENT-WIDE</span>
                  <span className="text-base sm:text-lg">📊</span>
                </div>
                <div className="font-display font-bold text-base sm:text-lg text-[var(--ink)] mb-1 text-safe">HOD Platform</div>
                <div className="text-[11px] text-[var(--slate)] leading-snug text-safe">
                  Monitor academic progress across all semesters, review faculty workloads, and approve requests.
                </div>
              </div>
              <div className="font-mono text-[10px] sm:text-[11px] text-[var(--brass)] font-semibold flex items-center gap-1 mt-3 pt-2 border-t border-[var(--rule)]/50 sm:border-t-0">
                Enter HOD Platform →
              </div>
            </button>

            {/* Platform: Faculty */}
            <button
              onClick={() => openStaffLogin('faculty')}
              className="role-card rounded-lg p-4 sm:p-5 text-left flex flex-col justify-between min-h-[160px] sm:h-48 cursor-pointer w-full"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[9px] sm:text-[10px] font-bold text-[var(--brass-2)] tracking-wider">ASSIGNED COURSES ONLY</span>
                  <span className="text-base sm:text-lg">👨‍🏫</span>
                </div>
                <div className="font-display font-bold text-base sm:text-lg text-[var(--ink)] mb-1 text-safe">Faculty Platform</div>
                <div className="text-[11px] text-[var(--slate)] leading-snug text-safe">
                  Access assigned semester courses, record session attendance, and enter assessment marks.
                </div>
              </div>
              <div className="font-mono text-[10px] sm:text-[11px] text-[var(--brass)] font-semibold flex items-center gap-1 mt-3 pt-2 border-t border-[var(--rule)]/50 sm:border-t-0">
                Enter Faculty Platform →
              </div>
            </button>

            {/* Platform: Student */}
            <button
              onClick={() => {
                setStudentName('Rahul Kumar');
                setStudentSem('3');
                setStudentError('');
                setStudentModalOpen(true);
              }}
              className="role-card rounded-lg p-4 sm:p-5 text-left flex flex-col justify-between min-h-[160px] sm:h-48 cursor-pointer w-full"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[9px] sm:text-[10px] font-bold text-[var(--brass-2)] tracking-wider">PERSONAL ENROLMENT</span>
                  <span className="text-base sm:text-lg">🎓</span>
                </div>
                <div className="font-display font-bold text-base sm:text-lg text-[var(--ink)] mb-1 text-safe">Student Platform</div>
                <div className="text-[11px] text-[var(--slate)] leading-snug text-safe">
                  Verify registered name and semester to access enrolled courses, timetable, attendance, and marks.
                </div>
              </div>
              <div className="font-mono text-[10px] sm:text-[11px] text-[var(--brass)] font-semibold flex items-center gap-1 mt-3 pt-2 border-t border-[var(--rule)]/50 sm:border-t-0">
                Verify Student Access →
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Staff Login Modal */}
      <Modal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        title={`${roleTitles[pendingStaffRole]} Authentication`}
        tag={`${pendingStaffRole.toUpperCase()} ACCESS`}
      >
        <form onSubmit={handleStaffSubmit} className="space-y-4">
          <div className="p-3 bg-[var(--parchment-2)] rounded border border-[var(--rule)] text-xs font-mono text-[var(--slate)]">
            <span className="font-bold text-[var(--ink)]">Demo Credentials:</span> Username:{' '}
            <code className="text-[var(--brass-2)] font-bold">{demoHints[pendingStaffRole]?.user}</code> | Password:{' '}
            <code className="text-[var(--brass-2)] font-bold">{demoHints[pendingStaffRole]?.pass}</code>
          </div>

          {staffError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-mono">
              {staffError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Username / ID:</label>
            <input
              type="text"
              required
              value={staffUser}
              onChange={(e) => setStaffUser(e.target.value)}
              className="field-input text-xs"
              placeholder="e.g. admin"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Password:</label>
            <input
              type="password"
              required
              value={staffPass}
              onChange={(e) => setStaffPass(e.target.value)}
              className="field-input text-xs"
              placeholder="Enter password"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStaffModalOpen(false)}
              className="btn-ghost border border-[var(--rule)] px-4 py-2.5 rounded text-xs font-mono w-full sm:w-auto min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-ink px-4 py-2.5 rounded text-xs font-mono font-bold w-full sm:w-auto min-h-[44px]"
            >
              Authorize &amp; Enter Platform →
            </button>
          </div>
        </form>
      </Modal>

      {/* Student Verification Modal */}
      <Modal
        isOpen={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        title="Student Access Verification"
        tag="STUDENT PORTAL"
      >
        <form onSubmit={handleStudentSubmit} className="space-y-4">
          <div className="p-3 bg-[var(--parchment-2)] rounded border border-[var(--rule)] text-xs font-mono text-[var(--slate)]">
            <span className="font-bold text-[var(--ink)]">Demo Student:</span> Enter{' '}
            <code className="text-[var(--brass-2)] font-bold">Rahul Kumar</code> (Sem 3) or{' '}
            <code className="text-[var(--brass-2)] font-bold">Ananya Sharma</code> (Sem 1).
          </div>

          {studentError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-mono">
              {studentError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Registered Student Name:</label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="field-input text-xs"
              placeholder="e.g. Rahul Kumar"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[var(--ink)] mb-1">Enrolled Semester:</label>
            <select
              value={studentSem}
              onChange={(e) => setStudentSem(e.target.value)}
              className="field-input text-xs"
            >
              <option value="1">Semester 1 (BCA 2025–28)</option>
              <option value="2">Semester 2 (BCA 2024–27)</option>
              <option value="3">Semester 3 (BCA 2024–27)</option>
              <option value="4">Semester 4 (BCA 2023–26)</option>
              <option value="5">Semester 5 (BCA 2023–26)</option>
              <option value="6">Semester 6 (BCA 2022–25)</option>
            </select>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStudentModalOpen(false)}
              className="btn-ghost border border-[var(--rule)] px-4 py-2.5 rounded text-xs font-mono w-full sm:w-auto min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-brass px-4 py-2.5 rounded text-xs font-mono font-bold w-full sm:w-auto min-h-[44px]"
            >
              Verify &amp; Enter Portal →
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
