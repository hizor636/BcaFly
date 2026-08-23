import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';

export const FacultyReportsPage = () => {
  const { activeSemester, activeWorkspace } = useAcademic();
  const courses = activeWorkspace?.courses || [];
  const students = activeWorkspace?.students || [];

  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.code || 'BCA302');

  const reportData = students.map(s => {
    const ciaAvg = Math.round(35 + (s.sgpa * 1.5));
    const att = s.attendance;
    return {
      ...s,
      ciaAvg,
      att,
      eligibility: att >= 75 ? 'Eligible' : 'Attendance Shortage',
      predictedGrade: s.sgpa >= 9.0 ? 'O' : s.sgpa >= 8.0 ? 'A+' : s.sgpa >= 7.0 ? 'A' : 'B+'
    };
  });

  const headers = ['Register No', 'Student Name', 'Section', 'Attendance %', 'CIA Average (50)', 'Predicted Grade', 'Status'];
  const rows = reportData.map(r => [
    r.reg || r.usn,
    r.name,
    r.section,
    `${r.att}%`,
    r.ciaAvg,
    r.predictedGrade,
    r.eligibility
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Course Performance Report — Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Comprehensive course-level analysis of attendance and internal assessment trends.
          </p>
        </div>
        <ExportToolbar
          filename={`bca_sem${activeSemester}_faculty_report_${selectedCourse}`}
          title={`Course Performance Report — ${selectedCourse}`}
          subtitle={`Semester ${activeSemester} — Department of Computer Applications`}
          headers={headers}
          rows={rows}
        />
      </div>

      <div className="p-4 bg-[var(--parchment-2)] border border-[var(--rule)] rounded-lg mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono font-bold text-[var(--ink)]">SELECT COURSE:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="field-input text-xs py-1.5 min-w-[220px]"
          >
            {courses.map(c => (
              <option key={c.code} value={c.code}>{c.code} — {c.name || c.title}</option>
            ))}
          </select>
        </div>
      </div>

      <LedgerTable
        columns={[
          {
            header: 'Reg No',
            accessor: 'reg',
            render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.reg || s.usn}</span>
          },
          { header: 'Student Name', accessor: 'name' },
          { header: 'Section', accessor: 'section', render: (s) => `Sec ${s.section}` },
          {
            header: 'Attendance %',
            accessor: 'att',
            render: (s) => (
              <span className={`font-mono font-bold ${s.att < 75 ? 'text-red-700' : 'text-emerald-800'}`}>
                {s.att}%
              </span>
            )
          },
          {
            header: 'CIA Average',
            accessor: 'ciaAvg',
            render: (s) => <span className="font-mono font-bold text-[var(--brass-2)]">{s.ciaAvg} / 50</span>
          },
          {
            header: 'Predicted Grade',
            accessor: 'predictedGrade',
            render: (s) => <Badge variant="pass">{s.predictedGrade}</Badge>
          },
          {
            header: 'Exam Eligibility',
            accessor: 'eligibility',
            render: (s) => (
              <Badge variant={s.eligibility === 'Eligible' ? 'pass' : 'fail'}>
                {s.eligibility}
              </Badge>
            )
          }
        ]}
        data={reportData}
      />
    </div>
  );
};
