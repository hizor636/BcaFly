import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

export const AdminAttendancePage = () => {
  const { activeSemester, activeWorkspace } = useAcademic();
  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];

  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.code || 'ALL');
  const [search, setSearch] = useState('');

  const activeCourseObj = courses.find(c => c.code === selectedCourse);

  const attendanceData = students.map(s => {
    const totalClasses = 45;
    const attended = Math.round((s.attendance / 100) * totalClasses);
    const missed = totalClasses - attended;
    return {
      ...s,
      conducted: totalClasses,
      attended,
      missed,
      status: s.attendance >= 75 ? 'Eligible' : s.attendance >= 65 ? 'Condonation' : 'Debarred'
    };
  });

  const headers = ['Register No', 'Student Name', 'Section', 'Conducted', 'Attended', 'Missed', 'Percentage', 'Eligibility Status'];
  const rows = attendanceData.map(a => [
    a.reg || a.usn,
    a.name,
    `Sec ${a.section}`,
    a.conducted,
    a.attended,
    a.missed,
    `${a.attendance}%`,
    a.status
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Semester {activeSemester} Attendance Records
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Aggregated lecture and lab attendance registers with institutional 75% eligibility check.
          </p>
        </div>
        <ExportToolbar
          filename={`bca_sem${activeSemester}_attendance`}
          title={`Semester ${activeSemester} Attendance Register`}
          subtitle={`Course: ${selectedCourse} — Minimum Required: 75%`}
          headers={headers}
          rows={rows}
        />
      </div>

      <div className="p-4 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs font-mono font-bold text-[var(--ink)]">FILTER BY COURSE:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="field-input text-xs py-1.5 min-w-[240px]"
          >
            <option value="ALL">All Semester {activeSemester} Courses (Consolidated)</option>
            {courses.map(c => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name || c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block"></span>
            <span>≥ 75% Eligible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
            <span>65-74% Condonation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-700 inline-block"></span>
            <span>&lt; 65% Debarred</span>
          </div>
        </div>
      </div>

      <LedgerTable
        searchPlaceholder="Search student attendance records..."
        searchValue={search}
        onSearchChange={setSearch}
        columns={[
          {
            header: 'Reg No',
            accessor: 'reg',
            render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.reg || s.usn}</span>
          },
          { header: 'Student Name', accessor: 'name' },
          { header: 'Section', accessor: 'section', render: (s) => `Sec ${s.section}` },
          { header: 'Total Sessions', accessor: 'conducted', render: (s) => <span className="font-mono">{s.conducted}</span> },
          { header: 'Attended', accessor: 'attended', render: (s) => <span className="font-mono text-emerald-800 font-bold">{s.attended}</span> },
          { header: 'Missed', accessor: 'missed', render: (s) => <span className="font-mono text-red-800">{s.missed}</span> },
          {
            header: 'Attendance %',
            accessor: 'attendance',
            render: (s) => <span className="font-mono font-bold text-sm">{s.attendance}%</span>
          },
          {
            header: 'Exam Eligibility',
            accessor: 'status',
            render: (s) => (
              <Badge variant={s.attendance >= 75 ? 'pass' : s.attendance >= 65 ? 'amber' : 'fail'}>
                {s.status}
              </Badge>
            )
          }
        ]}
        data={attendanceData}
      />
    </div>
  );
};
