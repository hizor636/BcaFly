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
    <div className="min-h-screen bg-[var(--parchment)] text-[var(--ink)]">
      {/* Landing Header */}
      <header className="max-w-6xl mx-auto px-6 pt-12 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#F5E8C9] border border-[#EAD6AB] text-[#B8892D] flex items-center justify-center font-brand font-bold text-2xl shadow-xs">
            B
          </div>
          <div>
            <div className="font-brand font-bold text-2xl text-[var(--ink)] leading-none">BcaFly</div>
            <div className="text-[10px] font-mono font-bold tracking-widest text-[var(--brass-2)] uppercase mt-1">
              BCA Academic Workspaces
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="ws-tag">AUTHORISED PLATFORM ACCESS</span>
          <button
            onClick={() => openStaffLogin('admin')}
            className="btn-ink text-xs font-mono px-4 py-2 rounded-md"
          >
            ADMINISTRATOR LOGIN →
          </button>
        </div>
      </header>

      {/* Main Hero & 4 Platform Cards */}
      <section className="max-w-6xl mx-auto px-6 py-6 grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-4">
            <span>🏛️</span> SIX SEMESTER-BASED ENVIRONMENTS
          </div>
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.12] mb-5 text-[var(--ink)] brass-underline pb-3 font-semibold">
            BCA Academic Workspaces.<br />Independent Semester Data.
          </h1>
          <p className="text-[var(--slate)] text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
            BcaFly supports all six BCA semesters through isolated academic environments. Each semester maintains
            independent course configurations, student enrolments, faculty allocations, timetables, and assessments.
          </p>

          {/* Semester Navigator Pills Preview */}
          <div className="mb-6">
            <div className="text-[11px] font-mono text-[var(--slate)] uppercase font-semibold mb-2">
              Supported Semester Workspaces:
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {[1, 2, 3, 4, 5, 6].map(s => (
                <span key={s} className="px-2.5 py-1 bg-white border border-[var(--rule)] rounded font-semibold text-[var(--ink)]">
                  [ Semester {s} ]
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs font-mono text-[var(--slate)] uppercase tracking-wider">
            Select your authorised platform to enter:
          </p>
        </div>

        {/* Four Independent Platforms Grid */}
        <div className="md:col-span-6 ledger-lines rounded-lg p-3 bg-[var(--parchment-2)] border border-[var(--rule)]">
          <div className="grid grid-cols-2 gap-3.5 p-2">
            {/* Platform: Administrator */}
            <button
              onClick={() => openStaffLogin('admin')}
              className="role-card rounded-lg p-5 text-left flex flex-col justify-between h-44 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold text-[var(--brass-2)] tracking-wider">ALL SIX SEMESTERS</span>
                  <span className="text-base">👑</span>
                </div>
                <div className="font-display font-bold text-lg text-[var(--ink)] mb-1">Administrator Platform</div>
                <div className="text-[11px] text-[var(--slate)] leading-snug">
                  Configure academic setup, manage courses, enrolment rosters, sections, and promotions.
                </div>
              </div>
              <div className="font-mono text-[10px] text-[var(--brass)] font-semibold flex items-center gap-1">
                Enter Admin Platform →
              </div>
            </button>

            {/* Platform: HOD */}
            <button
              onClick={() => openStaffLogin('hod')}
              className="role-card rounded-lg p-5 text-left flex flex-col justify-between h-44 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold text-[var(--brass-2)] tracking-wider">DEPARTMENT-WIDE</span>
                  <span className="text-base">📊</span>
                </div>
                <div className="font-display font-bold text-lg text-[var(--ink)] mb-1">HOD Platform</div>
                <div className="text-[11px] text-[var(--slate)] leading-snug">
                  Monitor academic progress across all semesters, review faculty workloads, and approve requests.
                </div>
              </div>
              <div className="font-mono text-[10px] text-[var(--brass)] font-semibold flex items-center gap-1">
                Enter HOD Platform →
              </div>
            </button>

            {/* Platform: Faculty */}
            <button
              onClick={() => openStaffLogin('faculty')}
              className="role-card rounded-lg p-5 text-left flex flex-col justify-between h-44 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold text-[var(--brass-2)] tracking-wider">ASSIGNED COURSES ONLY</span>
                  <span className="text-base">👨‍🏫</span>
                </div>
                <div className="font-display font-bold text-lg text-[var(--ink)] mb-1">Faculty Platform</div>
                <div className="text-[11px] text-[var(--slate)] leading-snug">
                  Access assigned semester courses, record session attendance, and enter assessment marks.
                </div>
              </div>
              <div className="font-mono text-[10px] text-[var(--brass)] font-semibold flex items-center gap-1">
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
              className="role-card rounded-lg p-5 text-left flex flex-col justify-between h-44 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold text-[var(--brass-2)] tracking-wider">PERSONAL ENROLMENT</span>
                  <span className="text-base">🎓</span>
                </div>
                <div className="font-display font-bold text-lg text-[var(--ink)] mb-1">Student Platform</div>
                <div className="text-[11px] text-[var(--slate)] leading-snug">
                  Verify registered name and semester to access enrolled courses, timetable, attendance, and marks.
                </div>
              </div>
              <div className="font-mono text-[10px] text-[var(--brass)] font-semibold flex items-center gap-1">
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

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStaffModalOpen(false)}
              className="btn-ghost border border-[var(--rule)] px-4 py-2 rounded text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-ink px-4 py-2 rounded text-xs font-mono font-bold"
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

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStudentModalOpen(false)}
              className="btn-ghost border border-[var(--rule)] px-4 py-2 rounded text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-brass px-4 py-2 rounded text-xs font-mono font-bold"
            >
              Verify &amp; Enter Portal →
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
