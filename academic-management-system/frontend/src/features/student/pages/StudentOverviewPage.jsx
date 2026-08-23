import React from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { MetricCard } from '../../../components/ui/MetricCard';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

export const StudentOverviewPage = () => {
  const { activeSemester, activeWorkspace, activities } = useAcademic();
  const { user } = useAuth();
  const navigate = useNavigate();

  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];

  // Current student object matching user
  const currentStudent = students.find(
    s => s.name.toLowerCase() === (user?.name || 'rahul kumar').toLowerCase() || s.reg === user?.usn || s.id === user?.id
  ) || students[0] || {
    name: user?.name || 'Rahul Kumar',
    reg: user?.usn || 'BCS23CA001',
    attendance: 88,
    sgpa: 8.85,
    cgpa: 8.92,
    section: 'A',
    batch: '2024–27',
    resultStatus: 'PASS'
  };

  const myActivities = activities.filter(
    a => a.studentName?.toLowerCase() === currentStudent.name.toLowerCase() || a.studentId === currentStudent.id
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--brass-soft)] border border-[var(--brass)] text-[var(--brass-2)] font-mono text-[11px] mb-2">
            <span>🎓</span> VERIFIED STUDENT PORTAL
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            {currentStudent.name} — Academic Portfolio
          </h3>
          <p className="text-xs text-[var(--slate)] font-mono">
            Register No: <span className="font-bold text-[var(--ink)]">{currentStudent.reg || currentStudent.usn}</span> • Section: {currentStudent.section} • Semester: {activeSemester}
          </p>
        </div>

        <button
          onClick={() => navigate('/student/submit-activity')}
          className="btn-brass px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs"
        >
          <span>🎖️</span> Submit Activity / OD Claim →
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="MY ATTENDANCE"
          value={`${currentStudent.attendance}%`}
          subtitle="● Threshold: ≥ 75%"
          valueColor={currentStudent.attendance >= 75 ? 'text-emerald-800' : 'text-red-700'}
          onClick={() => navigate('/student/attendance')}
        />
        <MetricCard
          title="SEMESTER SGPA"
          value={currentStudent.sgpa?.toFixed(2) || '8.85'}
          subtitle="● Grade Point Average"
          valueColor="text-[var(--brass-2)]"
          onClick={() => navigate('/student/results')}
        />
        <MetricCard
          title="CUMULATIVE CGPA"
          value={currentStudent.cgpa?.toFixed(2) || '8.92'}
          subtitle="● Overall Performance"
          onClick={() => navigate('/student/results')}
        />
        <MetricCard
          title="ACTIVITY PORTFOLIOS"
          value={myActivities.length}
          subtitle="● Verified & Pending"
          onClick={() => navigate('/student/submit-activity')}
        />
      </div>

      {/* Enrolled Courses */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-3 border-b border-[var(--rule)] pb-2">
          <div className="font-display font-bold text-sm text-[var(--ink)]">
            Enrolled Semester {activeSemester} Courses &amp; Instructors
          </div>
        </div>

        <LedgerTable
          columns={[
            {
              header: 'Course Code',
              accessor: 'code',
              render: (c) => <span className="font-mono font-bold text-[var(--ink)]">{c.code}</span>
            },
            { header: 'Course Title', accessor: 'name', render: (c) => c.name || c.title },
            { header: 'Course Type', accessor: 'type', render: (c) => <Badge variant="ink">{c.type}</Badge> },
            { header: 'Credits', accessor: 'credits', render: (c) => `${c.credits} Credits` },
            { header: 'Room Slot', accessor: 'room', render: (c) => c.room || 'Room 301' },
            {
              header: 'Status',
              accessor: 'code',
              render: () => <Badge variant="pass">ENROLLED</Badge>
            }
          ]}
          data={courses}
        />
      </div>
    </div>
  );
};
