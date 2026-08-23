import React, { useState } from 'react';
import { useAcademic } from '../../../context/AcademicContext';
import { LedgerTable } from '../../../components/common/LedgerTable';
import { Badge } from '../../../components/ui/Badge';
import { ExportToolbar } from '../../../components/ui/ExportToolbar';

export const HodBacklogsPage = () => {
  const { activeSemester, activeWorkspace } = useAcademic();
  const students = activeWorkspace?.students || [];
  const [search, setSearch] = useState('');

  const backlogStudents = students.filter(s => s.backlogCount > 0 || s.resultStatus === 'FAIL');

  const headers = ['Register No', 'Student Name', 'Section', 'Pending Arrears', 'Attendance %', 'Current SGPA', 'Remedial Action'];
  const rows = backlogStudents.map(s => [
    s.reg || s.usn,
    s.name,
    `Sec ${s.section}`,
    s.backlogCount || 1,
    `${s.attendance}%`,
    s.sgpa?.toFixed(2),
    'Special Remedial Class Scheduled'
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Remedial &amp; Backlog Register — Semester {activeSemester}
          </h3>
          <p className="text-xs text-[var(--slate)]">
            Tracking students with standing arrears, failure risk, and scheduling remedial coaching.
          </p>
        </div>
        <ExportToolbar
          filename={`bca_sem${activeSemester}_backlog_register`}
          title={`Semester ${activeSemester} Backlog & Remedial Register`}
          subtitle="Department of Computer Applications"
          headers={headers}
          rows={rows}
        />
      </div>

      <LedgerTable
        searchPlaceholder="Search backlog records..."
        searchValue={search}
        onSearchChange={setSearch}
        emptyMessage="Excellent! No students have active arrears in this semester workspace."
        columns={[
          {
            header: 'Reg No',
            accessor: 'reg',
            render: (s) => <span className="font-mono font-bold text-[var(--ink)]">{s.reg || s.usn}</span>
          },
          { header: 'Student Name', accessor: 'name' },
          { header: 'Section', accessor: 'section', render: (s) => `Sec ${s.section}` },
          {
            header: 'Arrear Count',
            accessor: 'backlogCount',
            render: (s) => (
              <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                {s.backlogCount || 1} Subject(s)
              </span>
            )
          },
          {
            header: 'Attendance %',
            accessor: 'attendance',
            render: (s) => <span className="font-mono">{s.attendance}%</span>
          },
          {
            header: 'SGPA',
            accessor: 'sgpa',
            render: (s) => <span className="font-mono font-bold">{s.sgpa?.toFixed(2)}</span>
          },
          {
            header: 'Remedial Status',
            accessor: 'status',
            render: () => <Badge variant="amber">REMEDIAL ASSIGNED</Badge>
          }
        ]}
        data={backlogStudents}
      />
    </div>
  );
};
