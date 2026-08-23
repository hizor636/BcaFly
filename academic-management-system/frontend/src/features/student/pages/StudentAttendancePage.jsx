import React from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { useAuth } from '../../../hooks/useAuth';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

export const StudentAttendancePage = () => {
  const { activeSemester, activeWorkspace } = useAcademic();
  const { user } = useAuth();
  const courses = activeWorkspace?.courses || [];

  const subjectAttendance = courses.map((c, idx) => {
    const conducted = 40 + (idx * 2);
    const attended = Math.round(conducted * (0.85 + (idx % 3) * 0.05));
    const percentage = Math.round((attended / conducted) * 100);
    return {
      code: c.code,
      name: c.name || c.title,
      credits: c.credits,
      conducted,
      attended,
      missed: conducted - attended,
      percentage,
      status: percentage >= 75 ? 'Eligible' : percentage >= 65 ? 'Condonation' : 'Debarred'
    };
  });

  const headers = ['Course Code', 'Course Title', 'Conducted', 'Attended', 'Missed', 'Percentage', 'Eligibility'];
  const rows = subjectAttendance.map(s => [s.code, s.name, s.conducted, s.attended, s.missed, `${s.percentage}%`, s.status]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            My Attendance — Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Subject-wise lecture attendance, conducted hours, and hall ticket eligibility standing.
          </p>
        </div>
        <ExportToolbar
          filename={`my_attendance_sem${activeSemester}`}
          title={`Student Attendance Report — Semester ${activeSemester}`}
          subtitle={`Student: ${user?.name || 'Rahul Kumar'}`}
          headers={headers}
          rows={rows}
        />
      </div>

      <div className="p-4 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[var(--brass-2)] font-bold">ATTENDANCE BENCHMARK:</span>
          <span>75% Minimum Required for Semester End Examinations</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[var(--slate)]">OVERALL STATUS:</span>
          <Badge variant="pass">HALL TICKET ELIGIBLE ✓</Badge>
        </div>
      </div>

      <LedgerTable
        columns={[
          {
            header: 'Course Code',
            accessor: 'code',
            render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.code}</span>
          },
          { header: 'Course Title', accessor: 'name' },
          { header: 'Conducted', accessor: 'conducted', render: (s) => <span className="font-mono">{s.conducted} Hrs</span> },
          { header: 'Attended', accessor: 'attended', render: (s) => <span className="font-mono font-bold text-emerald-800">{s.attended} Hrs</span> },
          { header: 'Missed', accessor: 'missed', render: (s) => <span className="font-mono text-red-800">{s.missed} Hrs</span> },
          {
            header: 'Percentage',
            accessor: 'percentage',
            render: (s) => <span className="font-mono font-bold text-sm">{s.percentage}%</span>
          },
          {
            header: 'Eligibility',
            accessor: 'status',
            render: (s) => (
              <Badge variant={s.percentage >= 75 ? 'pass' : s.percentage >= 65 ? 'amber' : 'fail'}>
                {s.status}
              </Badge>
            )
          }
        ]}
        data={subjectAttendance}
      />
    </div>
  );
};
